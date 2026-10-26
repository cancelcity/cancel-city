'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {AlertCircle,CheckCircle2,CloudOff,LoaderCircle,RefreshCw} from 'lucide-react';
import {useGame} from '../state/store';
import {Dialog} from './dialog';

const OPEN_MIGRATION='cancel-city.open-save-choice';
export function SharedSaveStatus(){
 const {save,hydrated,mode,guest,busy,error,clearError,migration}=useGame(),path=usePathname();
 const loading=!hydrated||mode==='loading',offline=mode==='offline',authRequired=/sign in|AUTH_REQUIRED/i.test(error||'');
 const title=migration?'CHOOSE YOUR SAVE':loading?'CONNECTING SAVE':error?'SAVE NEEDS ATTENTION':offline?'ACCOUNT DISCONNECTED':guest?'GUEST SAVE / ON THIS DEVICE':mode==='local'?'BROWSER SAVE':save?busy?'SAVING…':'ACCOUNT SAVE':'NEW ACCOUNT';
 const detail=migration?'Choose whether to copy your device progress into this new account.':loading?'You can learn or play practice without waiting.':error?error:offline?'Account progress is read-only. Independent practice still works.':guest?'Play now. Progress stays in this browser; connecting an account is optional.':mode==='local'?'Progress stays in this browser. It does not sync to an account.':save?'Your account progress is connected. Practice has its own browser save.':'Your first pack creates your game record. Three welcome packs are free.';
 const signin=`/signin-with-chatgpt?return_to=${encodeURIComponent(path||'/')}`;
 return <section className={`global-save-status ${loading?'is-loading':migration||error||offline?'needs-action':'is-ready'} save-mode-${mode}${guest?' save-is-guest':''}`} role={error?'alert':'status'} aria-live="polite"><div className="global-save-message">{loading?<LoaderCircle size={14}/>:error||offline?<CloudOff size={14}/>:migration?<AlertCircle size={14}/>:<CheckCircle2 size={14}/>}<b>{title}</b><span>{detail}</span></div><nav aria-label="Save actions">{migration&&<button onClick={()=>window.dispatchEvent(new Event(OPEN_MIGRATION))}>CHOOSE SAVE</button>}{guest&&<a href={signin} target="_top" title="Optional. Keep playing as a guest or connect an account when you want.">CONNECT ACCOUNT</a>}{authRequired&&!guest?<a href={signin} target="_top">SIGN IN WITH CHATGPT</a>:error||offline?<button disabled={busy} onClick={clearError}><RefreshCw size={12}/>RETRY CONNECTION</button>:null}{(loading||error||offline)&&<Link href="/battle/?practice=1">PLAY PRACTICE</Link>}<Link href="/settings/">SAVE DETAILS</Link></nav></section>;
}
export function SaveMigration(){
 const {migration,migrationSource,migrate,busy,error}=useGame(),[open,setOpen]=useState(false);
 useEffect(()=>{if(migration)setOpen(true);},[migration?.playerId]);
 useEffect(()=>{const show=()=>setOpen(true);window.addEventListener(OPEN_MIGRATION,show);return()=>window.removeEventListener(OPEN_MIGRATION,show);},[]);
 if(!migration||!open)return null;
 return <Dialog title="WHICH PROGRESS DO YOU WANT TO KEEP?" onClose={()=>setOpen(false)}><div className="global-save-choice"><p>This browser has {migrationSource==='guest'?'guest progress':'an older game record'}. Your signed-in account does not yet have a game record. Choose what to use for this account.</p><div className="save-choice-summary"><b>{migration.alias}</b><span>{migration.discoveredCardIds.length} characters · {migration.lifetimePacksOpened} packs opened · {migration.totalXp} XP</span></div><p>Keeping device progress copies it into your account once. Imported progress can play normally; verified rankings are disabled for that account. Your device copy stays here as a separate backup until you explicitly reset it. The two saves do not automatically merge.</p><div className="dialog-actions"><button className="button magenta" disabled={busy} onClick={()=>void migrate(true)}>KEEP MY {migrationSource==='guest'?'GUEST':'BROWSER'} PROGRESS</button><button className="button paper" disabled={busy} onClick={()=>void migrate(false)}>START A FRESH ACCOUNT</button></div>{error&&<p role="alert">{error}</p>}<Link href="/battle/?practice=1" onClick={()=>setOpen(false)}>DECIDE LATER / PLAY INDEPENDENT PRACTICE →</Link></div></Dialog>;
}
