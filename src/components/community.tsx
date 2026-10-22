'use client';
import {useEffect,useState} from 'react';
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

type PublicScore={alias:string;xp:number;wins:number};
export function LeaderboardScreen(){
 const {save,verified,mode,publicRank}=useGame();
 const [rows,setRows]=useState<PublicScore[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[refresh,setRefresh]=useState(0);
 useEffect(()=>{
  let active=true;
  if(mode==='loading'){setLoading(true);return;}
  if(mode!=='cloud'){setRows([]);setLoading(false);return;}
  setLoading(true);setError('');
  void api('leaderboard').then(payload=>{if(active)setRows(payload.players||[]);}).catch(e=>{if(active){setRows([]);setError(e instanceof Error?e.message:'Rankings are unavailable. Please retry.');}}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[mode,refresh]);
 const toggle=async()=>{
  setBusy(true);setError('');
  try{await api('rank',{enabled:!publicRank});useGame.setState({publicRank:!publicRank});setRefresh(value=>value+1);}
  catch(e){setError(e instanceof Error?e.message:'Could not update ranking participation.');}
  finally{setBusy(false);}
 };
 return <div className="leaderboard-page"><span className="tape yellow">THE CITY IS WATCHING</span><h1>PUBLIC<br/>MENACES.</h1><p>Verified accounts that chose to join. Ranked by earned XP, then scored battle wins. Only an opted-in player’s alias and scores appear in the public list.</p>
  {save&&<section className="exchange-wallet" aria-label="Your ranking participation"><span>{verified?publicRank?'PUBLIC PARTICIPATION: ON. You can leave at any time.':'PUBLIC PARTICIPATION: OFF. Your score is private.':'Local and imported progress cannot join verified rankings.'}</span><button className="button dark" disabled={!verified||mode!=='cloud'||busy||loading} onClick={()=>void toggle()}>{busy?'SAVING…':publicRank?'LEAVE RANKINGS':'JOIN RANKINGS'}</button></section>}
  {save&&<aside className="paper-panel" aria-label="Your private score"><b>YOUR SCORE / PRIVATE COMPARISON</b><p>{save.alias}: {save.totalXp.toLocaleString('en-US')} XP · {save.battle.wins} scored wins.</p><small>This card is shown only to you. It does not assign a public rank or add you to the list.</small></aside>}
  {loading?<p role="status">LOADING PUBLIC RANKINGS…</p>:mode!=='cloud'?<p role="status">Connect your account to view public rankings. Local scores stay on this device.</p>:error?<div role="alert"><p>{error}</p><button className="button paper" disabled={busy} onClick={()=>setRefresh(value=>value+1)}>RETRY RANKINGS</button></div>:!rows.length?<p role="status">No public scores yet. Joining rankings is optional.</p>:<table className="rank-table"><caption>LIVE PUBLIC RANKINGS · VERIFIED, OPTED-IN ACCOUNTS</caption><thead><tr><th>RANK</th><th>ALIAS</th><th>XP</th><th>WINS</th></tr></thead><tbody>{rows.map((score,index)=><tr key={`${score.alias}:${index}`}><td>#{index+1}</td><td>{score.alias}</td><td>{score.xp.toLocaleString('en-US')}</td><td>{score.wins}</td></tr>)}</tbody></table>}
  <details className="paper-panel"><summary>FICTIONAL HALL OF SHAME / FOR FUN</summary><p>These are authored fictional characters, not player accounts. Their scores are separate from public rankings.</p><table className="rank-table"><thead><tr><th>CHARACTER</th><th>FICTIONAL XP</th><th>FICTIONAL WINS</th></tr></thead><tbody>{MUNICIPAL_HALL_OF_SHAME.map(score=><tr key={score.alias}><td>{score.alias}</td><td>{score.xp.toLocaleString('en-US')}</td><td>{score.wins}</td></tr>)}</tbody></table></details>
 </div>;
}
export function FeedbackForm(){const [message,setMessage]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);return <section className="settings-panel"><h2>Report a city problem</h2><p>Share a bug or suggestion. Avoid personal information. Reports are stored for the site operator.</p><textarea aria-label="Feedback" maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="What happened? What did you expect?"/><button className="button acid" disabled={busy||message.trim().length<10} onClick={async()=>{setBusy(true);try{const p=await api('feedback',{kind:'feedback',message});setStatus(`Received. Reference: ${p.reference}`);setMessage('');}catch(e){setStatus(e instanceof Error?e.message:'Report unavailable.');}finally{setBusy(false);}}}>SEND FEEDBACK</button><p role="status">{status}</p></section>;}
