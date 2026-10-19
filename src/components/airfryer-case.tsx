'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,FileText,Scale} from 'lucide-react';
import {useGame,playReveal} from '../state/store';
import {freshAirfryer,ROUTES,VERDICTS,MOVES,QUESTIONS,routes,moves,argumentEffect,type AirfryerMove} from '../domain/airfryer';
import {CARD_BY_ID} from '../data/cards';
import {Portrait} from './card';
import {Dialog} from './dialog';
import {CityGameHeader,CityGameNavigation} from './game-chrome';

export function AirfryerCase(){
 const {save,enter,run,busy,error,hydrated,mode,clearError}=useGame();
 const a=save?.airfryer||freshAirfryer();const [open,setOpen]=useState(false);
 const disabled=busy||!hydrated||mode==='offline'||!!error;
 const start=async()=>{if(!useGame.getState().save&&!await enter())return;if(!useGame.getState().save?.city&&!await run({type:'city-start'}))return;if(await run({type:'airfryer-start'}))setOpen(true);};
 const verdict=a.outcome?VERDICTS[a.outcome]:null;
 return <>
  <section className={`airfryer-invitation phase-${a.phase}`} aria-label="Airfryer Gate story">
   <span className="case-eyebrow">{verdict?'ON THE RECORD':'NEIGHBOURHOOD STORY / 01'}</span>
   <h2>{verdict?verdict.sign:<>AIRFRYER<br/><em>GATE.</em></>}</h2>
   <p>{a.phase==='quiet'?'A charity stream. Zero meals. One screenshot too many.':a.phase==='leaked'?'Yasuo kept the receipt. Decide what the neighbourhood hears.':a.phase==='hearing'?'Your response is public. The jury wants the original receipt.':verdict?.relation}</p>
   {a.phase==='quiet'?<button className="case-action" disabled={disabled} onClick={()=>void start()}>FOLLOW THE SMOKE <ArrowRight size={18}/></button>:a.phase==='hearing'?<Link className="case-action" href="/battle/?case=airfryer">{a.history.length?'RESUME THE HEARING':'TAKE IT TO COURT'} <ArrowRight size={18}/></Link>:<button className="case-action" onClick={()=>setOpen(true)}>{verdict?'READ THE VERDICT':'OPEN THE LEAK'} <FileText size={18}/></button>}
   {a.route&&<small>PUBLIC PRESSURE {a.heat}/5 · {a.phase==='resolved'?'CASE CLOSED':'CASE OPEN'}</small>}
   {error&&<div className="case-error" role="alert">{error}<button onClick={clearError}>RETRY CONNECTION</button></div>}
  </section>
  {open&&<Dialog wide title={verdict?'AIRFRYER GATE / THE AFTERMATH':'AIRFRYER GATE / THE LEAK'} onClose={()=>setOpen(false)}>
   <div className="case-leak">
    <div className="case-leak-art"><Portrait card={CARD_BY_ID.CC135}/><span>DAENERYS AIRFRYER<br/>PALACE PROPRIETOR</span></div>
    <div className="case-leak-copy"><span className="case-eyebrow">{verdict?'A PERMANENT PART OF YOUR BLOCK':'YASUO POSTED THE UNEDITED CLIP'}</span><h2>{verdict?verdict.title:'“THE DONATIONS WERE FOR MY EMOTIONAL RECOVERY.”'}</h2><p>{verdict?verdict.copy:'Infinite Rizz sold a charity stream from the Palace. Daenerys provided the airfryer. Yasuo ordered the promised meal. The only thing delivered was a sponsor invoice.'}</p><blockquote>{verdict?verdict.relation:'“You fed the algorithm. I am still hungry.” — Yasuo 0/10'}</blockquote>{verdict&&<p className="case-reward">AWARDED ON VERDICT: {verdict.reward}</p>}</div>
   </div>
   {!verdict&&a.phase==='leaked'&&<><p className="case-choice-intro">CHOOSE WHAT GOES PUBLIC. Your response becomes evidence. This choice stays on record.</p><div className="case-choices">{routes.map(route=><button key={route} disabled={disabled||route==='bury'&&(save?.city?.influence||0)<25} onClick={async()=>{if(await run({type:'airfryer-choose',route}))setOpen(false);}}><span>0{routes.indexOf(route)+1}</span><h3>{ROUTES[route].title}</h3><p>{ROUTES[route].copy}</p><strong>{ROUTES[route].cost}</strong><small>{route==='bury'&&(save?.city?.influence||0)<25?'NEED 25 INFLUENCE':`EVIDENCE: ${ROUTES[route].headline}`}</small></button>)}</div></>}
   {verdict&&<Link className="case-action" href="/battle/?case=airfryer">REVIEW THE COURT RECORD <ArrowRight size={18}/></Link>}
  </Dialog>}
 </>;
}

export function AirfryerHearing(){
 const {save,run,busy,error,clearError,hydrated,mode}=useGame();const a=save?.airfryer||freshAirfryer();
 const [receiptOpen,setReceiptOpen]=useState(false),result=useRef<HTMLDivElement>(null),lastRound=useRef(a.history.length);
 useEffect(()=>{if(a.history.length>lastRound.current){result.current?.focus({preventScroll:true});if(save?.settings.soundEnabled)playReveal(a.phase==='resolved'?4:2,save.settings.volume);}lastRound.current=a.history.length;},[a.history.length,a.phase,save?.settings.soundEnabled,save?.settings.volume]);
 const route=a.route?ROUTES[a.route]:null,verdict=a.outcome?VERDICTS[a.outcome]:null,used=a.history.map(h=>h.move),latest=a.history.at(-1);
 const disabled=busy||!hydrated||!!error||mode==='offline';
 const forecast=(move:AirfryerMove)=>a.route?argumentEffect(a.route,move,a.pressure,a.credibility,used):null;
 return <div className="case-page"><CityGameHeader/><main className="case-hearing">
  <header className="case-heading"><Link href="/city/">← BACK TO YOUR BLOCK</Link><span>SCREENSHOT COURT / CASE 001</span><button onClick={()=>setReceiptOpen(true)} disabled={!route}><FileText size={16}/> THE RECEIPT</button></header>
  {!route?<section className="case-locked"><Scale size={40}/><h1>EVERY CASE STARTS SOMEWHERE.</h1><p>Follow the smoke at Airfryer Palace and decide what goes public.</p><Link className="case-action" href="/city/">RETURN TO THE CITY <ArrowRight/></Link></section>:<>
   <div className="case-scoreboard"><div><span>PUBLIC PRESSURE</span><strong>{a.pressure}<small>/ {route.pressure}</small></strong><meter min={0} max={Math.max(route.pressure,a.pressure)} value={a.pressure} aria-label="Public pressure"/></div><div className="case-round"><span>{verdict?'FINAL VERDICT':`STATEMENT ${a.history.length+1} OF 4`}</span><h1>AIRFRYER GATE</h1><p>Finish at ≤3 pressure and ≥3 credibility to clear the case.</p></div><div><span>YOUR CREDIBILITY</span><strong>{a.credibility}<small>/ 12</small></strong><meter min={0} max={12} value={a.credibility} aria-label="Your credibility"/></div></div>
   <section className={`case-stage ${verdict?'case-decided':''}`} aria-label="Airfryer Gate hearing">
    <img className="case-actor palace-owner" src="/assets/actors/CC135-roster-v2-0.webp" alt="Daenerys Airfryer stands before the court"/>
    <div className="case-dialogue" key={a.history.length}>
     <span className="case-eyebrow">{verdict?'THE CITY HAS HEARD ENOUGH':'THE JURY WOULD LIKE TO KNOW'}</span>
     <h2>{verdict?verdict.title:QUESTIONS[a.history.length]}</h2>
     <div className="case-testimony" ref={result} tabIndex={-1} role="status">{verdict?<><p>{verdict.copy}</p><strong>{verdict.reward}</strong><small>{verdict.relation}</small></>:latest?<><b>{MOVES[latest.move].title}</b><p>{latest.line}</p><small>Pressure {latest.pressure} · Credibility {latest.credibility} · Recorded</small></>:<p>Your response: {route.title.toLowerCase()}. The jury has your statement. You have the original receipt.</p>}</div>
     {verdict&&<Link className="case-action" href="/city/">SEE WHAT CHANGED IN YOUR BLOCK <ArrowRight size={18}/></Link>}
    </div>
    <img className="case-actor witness" src="/assets/actors/CC063-0.webp" alt="Infinite Rizz watches the hearing"/>
   </section>
   {!verdict&&<div className="case-hand" role="group" aria-label="Choose your court statement">{moves.map(move=>{const spent=move!=='divert'&&used.includes(move),next=forecast(move)!;return <button key={move} className={`case-statement move-${move}`} disabled={disabled||spent} onClick={()=>void run({type:'airfryer-argue',move,round:a.history.length})}><div className="case-statement-art"><Portrait card={CARD_BY_ID[MOVES[move].portrait]}/><span>{spent?'ON RECORD':move==='evidence'?'YOUR UNIQUE PROOF':move==='divert'?'REPEATABLE':'ONCE'}</span></div><h3>{MOVES[move].title}</h3><p>{move==='evidence'?`${route.headline}. −${route.proof} pressure · +1 credibility.`:MOVES[move].subtitle}</p><strong>{spent?'STATEMENT USED':`→ ${next.pressure} PRESSURE / ${next.credibility} CREDIBILITY`}</strong></button>;})}</div>}
   <details className="case-transcript"><summary>CASE RECORD · {a.history.length} STATEMENTS</summary><p>≤3 pressure and ≥3 credibility: case cleared. Otherwise ≤5 pressure: notorious. Above 5: public audit. Four statements. No timer.</p><ol>{a.history.map((h,i)=><li key={i}><b>{MOVES[h.move].title}</b> — {h.line} <small>Pressure {h.pressure} / Credibility {h.credibility}</small></li>)}</ol></details>
  </>}
  {error&&<div className="case-error" role="alert">{error}<button onClick={clearError}>RELOAD SAVED CASE</button></div>}
 </main><CityGameNavigation active="battle"/>{receiptOpen&&route&&<Dialog title="EXHIBIT A / ORIGINAL RECEIPT" onClose={()=>setReceiptOpen(false)}><div className="case-receipt"><span>PALACE RECORDS · DO NOT SHRED</span><h2>{route.headline}</h2><blockquote>{route.receipt}</blockquote><p>Submission: −{route.proof} pressure, +1 credibility. Once submitted, Follow the Money becomes supported by evidence.</p><b>{used.includes('evidence')?'ENTERED INTO THE COURT RECORD':'NOT YET SUBMITTED'}</b></div></Dialog>}</div>;
}
