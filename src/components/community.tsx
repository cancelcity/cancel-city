'use client';
import {useEffect,useMemo,useState} from 'react';
import {api,useGame} from '../state/store';

const MUNICIPAL_HALL_OF_SHAME:{alias:string;xp:number;wins:number}[]=[
 {alias:'xX_RatioGod_Xx',xp:4820,wins:44},
 {alias:'ElongatedBagHolder',xp:3950,wins:36},
 {alias:'NotesAppApologist',xp:3140,wins:29},
 {alias:'MidLane0And10',xp:2490,wins:22},
 {alias:'HOA_Supreme_Karen',xp:1860,wins:17},
 {alias:'SynergyGrindsetCEO',xp:1290,wins:12},
 {alias:'DiscordMod_NoGrass',xp:840,wins:8},
 {alias:'AirfryerEvangelist',xp:420,wins:4},
];

export function LeaderboardScreen(){
 const {save,verified,mode,publicRank}=useGame(),[rows,setRows]=useState<{alias:string;xp:number;wins:number}[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{
  let active=true;
  if(mode==='local'){setRows(MUNICIPAL_HALL_OF_SHAME);return;}
  void api('leaderboard').then(p=>{if(active)setRows(p.players?.length?p.players:MUNICIPAL_HALL_OF_SHAME);}).catch(()=>{if(active){setRows(MUNICIPAL_HALL_OF_SHAME);setError('');}});
  return()=>{active=false;};
 },[mode]);
 const enabled=publicRank;
 const toggle=async()=>{setBusy(true);try{await api('rank',{enabled:!enabled});useGame.setState({publicRank:!enabled});const p=await api('leaderboard');setRows(p.players?.length?p.players:MUNICIPAL_HALL_OF_SHAME);}catch(e){setError(e instanceof Error?e.message:'Could not update ranking.');}finally{setBusy(false);}};
 const displayRows=useMemo(()=>{
  const base=rows.length?rows:MUNICIPAL_HALL_OF_SHAME;
  if(!save)return base;
  const playerAlias=save.alias||'YOU (LOCAL MENACE)';
  const withoutSelf=base.filter(r=>r.alias!==playerAlias);
  return [...withoutSelf,{alias:`${playerAlias} ★ YOU`,xp:save.totalXp||0,wins:save.battle.wins||0}].sort((a,b)=>b.xp-a.xp||b.wins-a.wins);
 },[rows,save]);
 return <div className="leaderboard-page"><span className="tape yellow">THE CITY IS WATCHING</span><h1>PUBLIC<br/>MENACES.</h1><p>Municipal Hall of Shame &amp; verified cloud accounts. Ranked by earned XP, then campaign and daily wins. Participation is optional; only your alias and scores appear.</p>{save&&<div className="exchange-wallet"><span>{verified?'Your account is eligible for verified rankings.':'Local & imported progress is ranked against the Municipal Hall of Shame.'}</span><button className="button dark" disabled={!verified||mode!=='cloud'||busy} onClick={()=>void toggle()}>{enabled?'LEAVE RANKINGS':'JOIN RANKINGS'}</button></div>}{error&&<p role="alert">{error}</p>}<table className="rank-table"><thead><tr><th>RANK</th><th>ALIAS</th><th>XP</th><th>WINS</th></tr></thead><tbody>{displayRows.map((p,i)=><tr key={i} className={p.alias.endsWith('★ YOU')?'is-you':''}><td>#{i+1}</td><td>{p.alias}</td><td>{p.xp.toLocaleString('en-US')}</td><td>{p.wins}</td></tr>)}</tbody></table></div>;
}
export function FeedbackForm(){const [message,setMessage]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);return <section className="settings-panel"><h2>Report a city problem</h2><p>Share a bug or suggestion. Avoid personal information. Reports are stored for the site operator.</p><textarea aria-label="Feedback" maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="What happened? What did you expect?"/><button className="button acid" disabled={busy||message.trim().length<10} onClick={async()=>{setBusy(true);try{const p=await api('feedback',{kind:'feedback',message});setStatus(`Received. Reference: ${p.reference}`);setMessage('');}catch(e){setStatus(e instanceof Error?e.message:'Report unavailable.');}finally{setBusy(false);}}}>SEND FEEDBACK</button><p role="status">{status}</p></section>;}
