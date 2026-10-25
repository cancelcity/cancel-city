'use client';
import {TacticArt,TacticCard} from './tactic-card';
import {tacticType,allTactics,DUEL_CARDS,DUEL_LP,duelCard,duelStats,districtRecipe,detectDeckRecipe,type DuelCardId} from '../domain/duel-rules';
import type {TrainingLesson} from '../domain/duel-training';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {Check,Copy,Crown,Flag,Share2,Shield,Skull,Star,Swords,Zap} from 'lucide-react';
import {CARD_BY_ID} from '../data/cards';
import { specialAt } from '../data/specials';
import {abilityDescription,attackPower,availableDuos,districtOf,maxHp,takeTurn,type BattleAction,type BattleEvent,type Match} from '../domain/battle';
import {frontline,legalDuelActions,summonCost,forecastDuelAction} from '../domain/duel';
import {useGame} from '../state/store';
import {PrintedCard} from './printed-card';
import {specialPlayback,type CinematicMode} from '../domain/cinematic';
import {SpecialCinematic} from './special-cinematic';
import {liveCue,memeCue} from '../services/live-audio';
import {useCityMotion} from './city-motion';
import {Dialog} from './dialog';

const INK='#111016';
const PAPER='#f2e8cb';
const PINK='#ff169e';
const ACID='#deff00';
const CYAN='#38ffb3';

function DuelImpactCanvas({match,event,paused}:{match:Match;event:BattleEvent;paused:boolean}){
 const canvasRef=useRef<HTMLCanvasElement>(null),reduced=useCityMotion();
 useEffect(()=>{
  if(paused||reduced)return;
  const actorCardId=match[event.side]?.[event.actor]?.cardId||'CC001';
  const spec=specialAt(actorCardId);
  const accent=spec.accent||PINK;
  const targetX=event.targetSide==='enemy'?920:event.targetSide==='player'?280:600;
  const centerY=225;

  let raf=0;
  const start=performance.now();
  const duration=420;

  const paint=(now:number)=>{
   const p=Math.min(1,Math.max(0,(now-start)/duration));
   const canvas=canvasRef.current;
   const c=canvas?.getContext('2d');
   if(!canvas||!c)return;
   c.clearRect(0,0,1200,450);

   const hasHit=event.damage>0||event.lpDamage>0||event.knockout||!!event.reaction;
   const ix=hasHit?targetX:event.side==='player'?280:920;
   const iy=centerY;
   const fade=p>0.68?Math.max(0,(1-p)/0.32):1;

   c.save();
   c.translate(ix,iy);

   // 1-frame high-contrast impact flash on contact
   if(hasHit&&p<0.09){
    c.save();
    c.fillStyle='rgba(242,232,203,0.22)';
    c.fillRect(-ix,-iy,1200,450);
    c.restore();
   }

   // Pop-at-full-size comic ink starburst (never grows in from 0)
   if(hasHit&&p<0.55){
    c.save();
    c.globalAlpha=p<0.22?1:(0.55-p)/0.33;
    const spikes=12;
    c.beginPath();
    for(let i=0;i<spikes*2;i++){
     const a=(i*Math.PI)/spikes-0.18;
     const r=i%2===0?(i%4===0?112:88):34;
     if(i===0)c.moveTo(Math.cos(a)*r,Math.sin(a)*r);
     else c.lineTo(Math.cos(a)*r,Math.sin(a)*r);
    }
    c.closePath();
    c.fillStyle=event.knockout?PINK:PAPER;
    c.fill();
    c.lineWidth=5;
    c.strokeStyle=INK;
    c.stroke();

    // Sharp tapered anime cross-slash lines
    for(const slashAngle of [-0.52,0.44]){
     c.save();
     c.rotate(slashAngle);
     c.beginPath();
     c.moveTo(-135,0);
     c.lineTo(0,-9);
     c.lineTo(135,0);
     c.lineTo(0,9);
     c.closePath();
     c.fillStyle=accent;
     c.fill();
     c.lineWidth=3.5;
     c.strokeStyle=INK;
     c.stroke();
     c.restore();
    }
    c.restore();
   }

   // Crisp single ink shockwave ring
   c.save();
   c.globalAlpha=fade*0.85;
   c.beginPath();
   c.ellipse(0,0,46+p*96,30+p*62,0,0,Math.PI*2);
   c.strokeStyle=INK;
   c.lineWidth=7*(1-p*0.55);
   c.stroke();
   c.strokeStyle=event.knockout?PINK:event.heal>0?CYAN:ACID;
   c.lineWidth=3.5*(1-p*0.55);
   c.stroke();
   c.restore();

   // Bold comic callout headline with hard offset ink shadow
   const headline=event.reaction?'TRAP SPRUNG!':event.knockout?'CANCELLED!':event.damage>=24?'MEGA RATIO!':event.damage>0?'DIRECT HIT!':event.heal>0?'RESTORED!':event.kind==='guard'?'LAWYERED UP!':'TAGGED IN!';
   c.save();
   c.globalAlpha=fade;
   c.translate(0,-48-p*14);
   c.rotate(-0.05);
   c.font='900 40px CityDisplay,Impact,sans-serif';
   c.textAlign='center';
   c.textBaseline='middle';
   c.fillStyle=INK;
   c.fillText(headline,4,5);
   c.lineWidth=7;
   c.strokeStyle=INK;
   c.strokeText(headline,0,0);
   c.fillStyle=event.knockout?PINK:event.heal>0?CYAN:ACID;
   c.fillText(headline,0,0);
   c.restore();

   c.restore();

   if(p<1)raf=requestAnimationFrame(paint);
  };

  raf=requestAnimationFrame(paint);
  return()=>cancelAnimationFrame(raf);
 },[match,event,paused,reduced]);

 if(paused||reduced)return null;
 return <canvas ref={canvasRef} width={1200} height={450} className="duel-impact-canvas" aria-hidden="true"/>;
}

export function DuelRules({version=4}:{version?:number}){if(version>=5)return <>
 <p><b>THREE CARD TYPES.</b> Fighters are resident characters with HP, ATK, DEF and a Special. Spells are immediate actions. Traps wait face down for a trigger. Specials belong to fighters; they are not separate spell cards.</p><p>Build a twelve-card tactics deck with at most two copies of each card. All {DUEL_CARDS.length} tactics are free. Your deck is saved in this browser and snapshotted into each new duel.</p><p><b>PREPARE, THEN FIGHT.</b> Bring three residents. Your lead starts deployed; its printed star cost is deducted from your six opening stars. Both sides start with 120 LP.</p>
 <dl><dt>1 · DEPLOY — OPTIONAL</dt><dd>Once per turn, summon one reserve for its printed stars OR tag in a summoned resident for 1 star. This does not end the turn. No tributes in this three-resident format.</dd>
 <dt>2 · TACTIC — OPTIONAL</dt><dd>Once per turn, play one spell or set one trap, paying its star cost. Inspect the card, then press PLAY or SET. You can deploy and play a tactic in either order.</dd>
 <dt>3 · FIGHT — ENDS YOUR TURN</dt><dd>Attack for ATK damage and gain 1 hype; defend to use your printed DEF and gain 1 hype; or spend 3 hype on your Special. A Duo also needs 1 hype from a summoned matching partner. End Turn skips fighting if you prefer to save resources.</dd>
 <dt>WIN · REDUCE ENEMY LP TO ZERO</dt><dd>Each knockout costs its owner 40 LP. Overkill and attacks against an empty frontline also damage LP. An already summoned bench resident replaces a knockout automatically; other reserves must be deployed. A total crew defeat therefore ends the duel.</dd>
 <dt>DEFENSE / SHIELDS</dt><dd>While defending, subtract DEF from incoming power (minimum 1), then apply temporary shields. Defense lasts until that resident attacks, casts a damaging spell or uses a Special. Weakness reduces the next hit by 30%; exposure increases the next incoming hit by 25%. Piercing ignores DEF and percentage shields, but still triggers traps.</dd>
 <dt>NEW TURN</dt><dd>Gain 2 stars (maximum 6), reset your deployment and tactic slots, and draw one card. Hand limit 5: an extra draw discards the drawn card. The twelve-card deck does not recycle. Empty-deck draws cost 5 LP, then 10, 15, and so on, so a defensive loop cannot last forever.</dd>
 <dt>TRAPS</dt><dd>One set trap per side. Community Note halves the next damaging hit. Cease &amp; Desist cancels the next enemy Special, Duo or damaging spell; its costs are still spent. Terms &amp; Conditions Apply cancels the next healing spell or healing Special, including its other effects. Skill Issue Insurance restores up to 16 HP before a hit on a wounded frontline; it does not trigger at full HP or revive anyone. 404: Accountability Not Found cancels an ordinary Attack but still grants its hype. Chargeback Goblin refunds up to 2 stars before a damaging spell, Special or Duo; the hit still lands. Screenshotted in 4K exposes an attacker before a damaging hit without reducing it. Traps react automatically once, then discard. Forecasts do not reveal face-down traps.</dd></dl>
 <p>Practice is saved separately in this browser and works without a cloud connection. It never changes your collection, rewards or saved Roast Night. Campaign keeps existing reward rules. Older saved battles retain their original rules.</p>
 </>;return <>
 <p><b>SUMMON. DEFEND. CANCEL.</b> Three residents, 120 Life Points each side. Win by reducing enemy LP to zero or cancelling all three residents. Your collection is never consumed.</p>
 <dl><dt>ONE ACTION PER TURN</dt><dd>Summon, attack, defend, use a Special, play a card, tag in or pass. Then the opponent acts. No invisible combo multiplier.</dd>
 <dt>STARS / SUMMONING</dt><dd>Start with 6 stars. From your second turn, gain 2 stars and draw one card (hand limit 5, stars limit 10). Summon a reserve for its printed ★ cost. Optional: tribute a different summoned resident to save 2 stars, minimum cost 1. The tribute is cancelled for this duel.</dd>
 <dt>HP / ATK / DEF</dt><dd>ATK damages the opposing frontline’s HP. Defense stance subtracts the printed DEF from each hit, minimum 1 damage; temporary shields then reduce it further. Defense lasts until that resident attacks, uses a Special or casts a damaging spell. Excess damage and attacks against an empty frontline hit LP. Only already summoned residents can automatically replace a knockout.</dd>
 <dt>SPECIALS / DUOS</dt><dd>Attacking or defending gains 1 hype. A Special spends 3 hype on the resident’s listed ability. A Duo also spends 1 hype from its summoned matching partner, once per side per duel. These are abilities, not tributes.</dd>
 <dt>SPELLS / TRAPS</dt><dd>Play cards from your saved hand by spending their printed star cost. Spells resolve immediately. Set one trap: Community Note halves the next damaging hit; Cease &amp; Desist cancels the next opposing Special, Duo or damaging spell. Traps trigger automatically and discard after use. Cancelled effects still spend their costs. Used cards recycle when the draw pile empties.</dd>
 <dt>RESERVES / SYNERGY</dt><dd>Tagging in a previously summoned resident costs 1 star and your action. Three matching factions start with 2 hype; three different factions start with a 35% temporary shield. Foils have identical combat stats.</dd></dl>
 <p>Campaign, daily and mastery rewards follow the existing progression. Practice earns no rewards. After 40 rounds, higher LP wins; equal LP is decided by remaining health proportions, then the city wins a tie. Surrender records a loss.</p>
 </>;}

type DuelController={ready:boolean;act:(action:BattleAction)=>Promise<boolean>;enemy:()=>Promise<boolean>;surrender:()=>Promise<boolean>};
export function DuelArena({match,isPreview=false,onAutoStart,onLeave,onRematch,paused,cinematicMode='full',controller,blockedReason,onPractice,onCampaign,training}:{match:Match;isPreview?:boolean;onAutoStart?:(action:BattleAction)=>Promise<void>;onLeave:()=>void;onRematch:()=>void;paused:boolean;cinematicMode?:CinematicMode;controller?:DuelController;blockedReason?:string|null;onPractice?:()=>void;onCampaign?:()=>void;training?:{lesson:TrainingLesson;allows:(action:BattleAction)=>boolean}}){
 const game=useGame(),{save,run}=game,busy=controller?false:game.busy,hydrated=controller?controller.ready:game.hydrated;
 const [matchDeckOpen,setMatchDeckOpen]=useState(false),[specialOpen,setSpecialOpen]=useState(false);
 const [selectedTactic,setSelectedTactic]=useState<DuelCardId|null>(null),tacticConfirm=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(selectedTactic)tacticConfirm.current?.focus();},[selectedTactic]);
 const [completedStep,setCompletedStep]=useState(match.step),[confirm,setConfirm]=useState(false),[hint,setHint]=useState<string|null>(null),[tribute,setTribute]=useState<number|null>(null),enemyAttempt=useRef<string|null>(null);
 const [impactStep,setImpactStep]=useState(-1),[trapSplashStep,setTrapSplashStep]=useState(-1),[copiedLink,setCopiedLink]=useState(false),prevStepRef=useRef(match.step);
 const last=match.events.at(-1),cinematic=!paused&&cinematicMode!=='off'&&last?.kind==='ability'&&!['Cease & Desist','Terms & Conditions Apply'].includes(last.reaction)&&match.step>completedStep&&!(last.lpDamage&&!last.damage)?specialPlayback(match,last,last.side==='player'?save?.props.loadout[match.player[last.actor].cardId]||null:null):null;
 const tactical=match.rulesVersion>=5,duel=match.duel!,lead=frontline(match,'player'),opponent=frontline(match,'enemy'),finished=match.phase==='finished',ready=hydrated&&!busy&&!paused&&!matchDeckOpen&&!cinematic&&match.phase==='player'&&!blockedReason&&(!!controller||!save?.roast||save.roast.phase==='finished');

 useEffect(()=>{
  if(match.step===prevStepRef.current)return;
  prevStepRef.current=match.step;
  if(!last)return;
  setImpactStep(match.step);
  const t1=setTimeout(()=>setImpactStep(s=>s===match.step?-1:s),1050);
  let t2:ReturnType<typeof setTimeout>|undefined;
  if(last.reaction){
   setTrapSplashStep(match.step);
   t2=setTimeout(()=>setTrapSplashStep(s=>s===match.step?-1:s),1950);
  }
  if(!paused&&(save?.settings.soundEnabled??false)){
   const vol=save?.settings.volume??0.7;
   if(last.reaction){memeCue('ticket',vol);liveCue('impact','shield',vol);}
   else if(last.knockout)liveCue('impact','rocket',vol);
   else if(last.damage>0||last.lpDamage>0)liveCue('impact','stamp',vol);
   else if(last.heal>0||last.kind==='guard')memeCue('cash',vol);
   else if(last.kind==='switch')liveCue('windup','paper',vol);
  }
  return()=>{clearTimeout(t1);if(t2)clearTimeout(t2);};
 },[match.step,last,paused,save?.settings.soundEnabled,save?.settings.volume]);

 const actions=legalDuelActions(match,'player'),legal=(action:BattleAction)=>(!training||training.allows(action))&&(action.type==='duo'?availableDuos(match,'player').some(d=>!action.duoId||d.id===action.duoId):actions.some(a=>JSON.stringify(a)===JSON.stringify(action)));
 const unavailable=(action:BattleAction)=>{if(match.phase!=='player')return 'Wait for your turn.';if(training&&!training.allows(action))return 'Follow the current lesson action.';try{takeTurn(match,'player',action);return '';}catch(e){return e instanceof Error?e.message:'Unavailable.';}};
 const act=async(action:BattleAction)=>{if(!ready||!legal(action))return;setHint(null);setTribute(null);if(controller){if(await controller.act(action))setSelectedTactic(null);return;}if(isPreview){await onAutoStart?.(action);return;}if(await run({type:'battle-act',matchId:match.id,step:match.step,action}))setSelectedTactic(null);};
 useEffect(()=>{
  if(isPreview||paused||matchDeckOpen||specialOpen||busy||cinematic||match.phase!=='enemy')return;
  const key=`${match.id}:${match.step}`;if(enemyAttempt.current===key)return;
  const timer=setTimeout(()=>{enemyAttempt.current=key;void (controller?controller.enemy():run({type:'battle-enemy',matchId:match.id,step:match.step})).then(ok=>{if(!ok)enemyAttempt.current=null;});},650);
  return()=>clearTimeout(timer);
 },[match.id,match.step,match.phase,isPreview,paused,matchDeckOpen,specialOpen,busy,run,cinematic?.key,controller?.enemy]);
 const attack=forecastDuelAction(match,{type:'attack'}),specialForecast=forecastDuelAction(match,{type:'ability'}),duos=availableDuos(match,'player');
 const specialDescription=lead?abilityDescription(CARD_BY_ID[lead.cardId],match.districtId,'player',4):'Deploy a fighter to use its Special.';
 const describe=(action:BattleAction)=>{const event=forecastDuelAction(match,action);return event?`${event.damage} HP + ${event.lpDamage} LP damage${event.reaction?` · triggers ${event.reaction}`:''}`:'Summon a resident first.';};
 const reactedCard=last?.reaction?DUEL_CARDS.find(c=>c.name===last.reaction):undefined;
 const enemyRecipe=districtRecipe(match.districtId,match.challengeKey);
 const playerRecipe=detectDeckRecipe(allTactics(duel.player));
 const turnCount=tactical?Math.floor((duel.turnNumber-1)/2)+1:Math.floor(match.step/2)+1;
 const buildChallengeUrl=()=>{
  const origin=typeof window!=='undefined'?window.location.origin:'https://cancel-city.pages.dev';
  const alias=encodeURIComponent(save?.alias||'LocalMenace');
  const crew=match.player.map(f=>f.cardId).join(',');
  return `${origin}/battle/?vs=${crew}&by=${alias}&raid=1&recipe=${playerRecipe.id}`;
 };
 const copyChallengeUrl=()=>{
  if(typeof navigator==='undefined'||!navigator.clipboard)return;
  void navigator.clipboard.writeText(buildChallengeUrl()).then(()=>{setCopiedLink(true);setTimeout(()=>setCopiedLink(false),2400);});
 };
 const shareOnXUrl=()=>{
  const url=buildChallengeUrl();
  const verdict=match.winner==='player'?`⚖️ VERIFIED RATIO in ${districtOf(match.districtId).name} (${duel.player.lp} LP left in ${turnCount} turns)!`:`💀 Survived ${turnCount} turns in ${districtOf(match.districtId).name}'s Cancel Court!`;
  const text=`${verdict}\nThink your crew can beat my "${playerRecipe.name}" Tactics Deck (${match.player.map(f=>CARD_BY_ID[f.cardId].name).join(' · ')})? Step into Screenshot Court:`;
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
 };

 return <section data-training={training?.lesson} className={`duel-arena ${finished?'duel-finished':''} ${impactStep===match.step&&(last?.damage||last?.lpDamage)?'duel-stage-shake':''}`} aria-label="Cancel City card duel">
  {blockedReason&&!controller&&<div className="duel-play-block"><b>{blockedReason}</b>{onPractice&&<button className="button magenta" onClick={onPractice}>PLAY PRACTICE — NO LOGIN</button>}</div>}
  <div className="duel-score-row">{(['player','enemy'] as const).map(side=>{
   const lpHit=impactStep===match.step&&last?.targetSide===side&&(last?.lpDamage??0)>0;
   return <div key={side} className={`battle-player-label ${side==='enemy'?'enemy':''} ${lpHit?'is-lp-hit':''}`}><Skull/><span><b>{side==='player'?save?.alias||'LOCAL MENACE':'THE CANCEL MOB'}</b><small>{side==='player'?`YOUR LP · ${playerRecipe.name.toUpperCase()}`:`OPPONENT LP · ${enemyRecipe.name.toUpperCase()}`}</small><strong className="duel-lp">{duel[side].lp}<small> / {DUEL_LP} LP</small>{lpHit&&<em className="duel-lp-delta">−{last!.lpDamage} LP</em>}</strong><meter aria-label={`${side} life points`} min={0} max={DUEL_LP} value={duel[side].lp}/></span><span className="duel-star-score"><Star/>{duel[side].stars}</span></div>;
  })}<div className="duel-turn"><b className="tape yellow">TURN {turnCount}</b><strong>{training?.lesson==='done'?'TRAINING COMPLETE':finished?'FINAL VERDICT':isPreview?(tactical?'YOUR FIRST TURN':'SUMMON YOUR FIRST RESIDENT'):match.phase==='player'?'YOUR MOVE':'CITY’S MOVE'}</strong><small>{tactical?'PREPARE → FIGHT · +2 STARS / TURN':'ONE ACTION · +2 STARS / TURN'}</small></div></div>
  {tactical&&!finished&&<ol className="duel-turn-steps" aria-label="Your turn sequence"><li className={duel.player.deploymentUsed?'used':''}><b>1 · DEPLOY</b><span>{duel.player.deploymentUsed?'Used this turn':'Optional · summon or tag in'}</span></li><li className={duel.player.tacticUsed?'used':''}><b>2 · TACTIC</b><span>{duel.player.tacticUsed?'Used this turn':'Optional · one spell or trap'}</span></li><li className="battle-step"><b>3 · FIGHT</b><span>Attack, defend or Special ends turn</span></li></ol>}
  <div className="duel-field">
   {impactStep===match.step&&last&&<DuelImpactCanvas key={`vfx-${match.step}`} match={match} event={last} paused={paused}/>}
   {(['player','enemy'] as const).map(side=><div key={side} className={`duel-crew ${side}`} aria-label={`${side} residents`}>{match[side].map((f,slot)=>{
   const card=CARD_BY_ID[f.cardId],active=f===frontline(match,side),cost=summonCost(match,side,slot),summon:BattleAction={type:'summon',slot,...(tribute===null?{}:{tributeSlot:tribute})},tag:BattleAction={type:'switch',slot};
   const isActor=impactStep===match.step&&last?.side===side&&last?.actor===slot;
   const isTarget=impactStep===match.step&&last?.targetSide===side&&last?.target===slot;
   const isStriking=isActor&&(last?.kind==='attack'||last?.kind==='ability');
   const isHit=isTarget&&((last?.damage??0)>0||last?.knockout);
   const isHealed=isTarget&&(last?.heal??0)>0;
   const isSummoned=isTarget&&last?.kind==='switch';
   const specialReady=active&&f.summoned&&f.hp>0&&f.charge>=3;
   return <article key={card.id} className={`duel-resident ${active?'active':''} ${!f.summoned?'reserve':''} ${f.hp===0?'cancelled':''} ${specialReady?'is-special-ready':''} ${isStriking?'is-duel-striking':''} ${isHit?'is-duel-hit':''} ${isHealed?'is-duel-healed':''} ${isSummoned?'is-duel-summoned':''}`}>
    {specialReady&&<span className="duel-special-ready-badge" aria-hidden="true">⚡ SPECIAL READY</span>}
    <PrintedCard card={card} health={{value:f.hp,max:maxHp(card.id,match.districtId,side,4)}} atk={attackPower(card.id,match.districtId,side,4)} def={duelStats(card.id).defense} stance={f.summoned?f.stance:undefined}/>
    {isTarget&&(last!.damage>0||last!.heal>0||last!.knockout)&&<div className={`duel-floating-splat ${last!.knockout?'ko':last!.damage>0?'dmg':'heal'}`} aria-hidden="true"><b>{last!.knockout?'CANCELLED!':last!.damage>0?`−${last!.damage} HP`:`+${last!.heal} HP`}</b>{last!.lpDamage>0&&<small>−{last!.lpDamage} LP</small>}</div>}
    <div className="duel-resident-status"><b>{!f.hp?'CANCELLED':!f.summoned?'RESERVE':active?'FRONTLINE':'SUMMONED'}</b><span title={`${f.charge} of 3 hype`}>{'⚡'.repeat(f.charge)}</span>{f.guard>0&&<small>SHIELD {f.guard*100}%</small>}{f.exposed&&<small>EXPOSED</small>}{f.weakened&&<small>WEAKENED</small>}</div>
    {side==='player'&&f.hp>0&&(!f.summoned?<button className="duel-summon" disabled={!ready||!legal(summon)} onClick={()=>void act(summon)}>{tribute===null?`${tactical?'DEPLOY & TAKE FRONTLINE':'SUMMON'} · ${cost} ★`:`TRIBUTE + ${Math.max(1,cost-2)} ★`}</button>:<div className="duel-resident-actions">{!active&&<button disabled={!ready||!legal(tag)} onClick={()=>void act(tag)}>TAG IN · 1 ★</button>}{!tactical&&<button aria-pressed={tribute===slot} disabled={!ready||!match.player.some(p=>!p.summoned&&p.hp>0)} onClick={()=>setTribute(tribute===slot?null:slot)}>{tribute===slot?'CANCEL TRIBUTE':'OFFER AS TRIBUTE'}</button>}</div>)}
   </article>;
  })}<div className={`duel-trap-zone ${(side==='player'?duel.player.trap:duel.enemy.trap)?'is-armed':''}`}>{side==='player'?(duel.player.trap?<><b>SET: {duelCard(duel.player.trap).name}</b><small>{duelCard(duel.player.trap).text}</small></>:<span>YOUR TRAP ZONE · EMPTY</span>):<span>{duel.enemy.trap?'OPPONENT TRAP SET · FACE DOWN':'OPPONENT TRAP ZONE · EMPTY'}</span>}</div></div>)}
   <div className={`duel-center ${impactStep===match.step?'is-pulsing':''}`} aria-live="polite"><Crown/><strong>{finished?(match.winner==='player'?'RATIO!':'CANCELLED!'):last?.title||(tactical?'YOUR MOVE':'SUMMON!')}</strong><span className="tape paper">{finished?match.reason==='lp'?'LIFE POINTS DEPLETED':match.reason==='knockout'?'CREW CANCELLED':match.reason==='surrender'?'TACTICAL RETREAT':'40-ROUND VERDICT':'LOCAL NEWS CHAOS'}</span>{last&&<small>{last.damage?`−${last.damage} HP `:''}{last.lpDamage?`−${last.lpDamage} LP `:''}{last.heal?`+${last.heal} HP`:''}{last.reaction&&<b>TRAP: {last.reaction}</b>}</small>}</div>
  </div>
  {trapSplashStep===match.step&&reactedCard&&!finished&&(
   <div className="duel-trap-splash" role="status" onClick={()=>setTrapSplashStep(-1)}>
    <div className="duel-trap-3d-stage">
     <div className="duel-trap-3d-flipper">
      <div className="duel-trap-face-back" aria-hidden="true">
       <span>CANCEL CITY // ARMED TRAP</span>
       <b>⚡ TRIGGERED ⚡</b>
      </div>
      <div className="duel-trap-splash-card duel-trap-face-front">
       <span className="tape yellow">⚡ {tacticType(reactedCard.kind)} ACTIVATED! ⚡</span>
       <div className="duel-trap-splash-body">
        <TacticArt id={reactedCard.id}/>
        <div>
         <h3>{reactedCard.name}</h3>
         <p>{last?.text}</p>
         <em>“{reactedCard.flavor}”</em>
        </div>
       </div>
      </div>
     </div>
    </div>
   </div>
  )}
  {finished?<div className="duel-result" role="status">
   <div className="duel-verdict-receipt">
    <span className={`duel-verdict-stamp ${match.winner==='player'?'won':'lost'}`}>{match.winner==='player'?'VERIFIED RATIO':'CONTEMPT OF COURT'}</span>
    <small className="duel-verdict-meta">{districtOf(match.districtId).name.toUpperCase()} · {turnCount} TURNS · {duel.player.lp} LP VS {duel.enemy.lp} LP · DECK: {playerRecipe.name.toUpperCase()}</small>
   </div>
   <h2>{match.winner==='player'?'YOU WON THE THREAD.':'THE INTERNET NEVER FORGETS.'}</h2>
   <p className="duel-result-explanation">{last?.text}</p>
   <p>{match.reward.packs?`+${match.reward.packs} packs · +${match.reward.xp} XP · saved`:match.mode==='practice'?'Practice complete. Your collection is safe.':'Result saved. Your collection is safe.'}</p>
   <div className="duel-result-actions">
    {match.reward.packs>0?<Link className="button magenta" href="/packs/">OPEN YOUR REWARD PACK →</Link>:onCampaign?<button className="button magenta" onClick={onCampaign}>PLAY CAMPAIGN FOR REWARDS →</button>:<button className="button magenta" disabled={busy} onClick={onLeave}>REVIEW CREW &amp; RETRY</button>}<button className="button paper" disabled={busy} onClick={onRematch}>REMATCH</button>
    <button className="button paper" disabled={busy} onClick={onLeave}>CHANGE CREW</button>
    <details className="duel-share-options"><summary>SHARE VERDICT</summary><a className="button acid duel-share-x" href={shareOnXUrl()} target="_blank" rel="noopener noreferrer"><Share2 size={16}/> POST VERDICT &amp; CHALLENGE ON X</a>
    <button type="button" className="button paper duel-copy-challenge" onClick={copyChallengeUrl}>{copiedLink?<><Check size={15}/> CHALLENGE LINK COPIED!</>:<><Copy size={15}/> COPY CHALLENGE LINK</>}</button>
    </details>{match.reward.packs>0&&<p>Your reward is already saved. Collect a pack, then review your crew for the next case.</p>}
   </div>
  </div>:<div className="duel-controls">
   <section className="duel-command-panel"><div className="duel-resource"><Star/><b>{duel.player.stars} / {tactical?6:10}</b><span>STARS<small>{tactical?'For deployment and tactics · +2 each new turn':'+2 each turn after your opener'}</small></span></div><p className="duel-guidance">{tribute!==null?`Tributing ${CARD_BY_ID[match.player[tribute].cardId].name}: choose a reserve. This cancels the tribute for this duel.`:!lead?(tactical?'Frontline empty: deploy a reserve, then fight. Attacks against an empty frontline hit LP.':'Choose a reserve above to summon. An empty frontline leaves your LP exposed.'):`${CARD_BY_ID[lead.cardId].name} · ${lead.charge}/3 HYPE · ${lead.stance.toUpperCase()} STANCE`}</p><div className="duel-main-actions"><button disabled={!ready||!legal({type:'attack'})} onClick={()=>void act({type:'attack'})} onMouseEnter={()=>setHint(describe({type:'attack'}))} onFocus={()=>setHint(describe({type:'attack'}))}><Swords/><b>ATTACK</b><small>{attack?`${attack.damage} HP / ${attack.lpDamage} LP${tactical?' · +1 HYPE · END TURN':''}`:!lead?'DEPLOY FIRST':match.phase==='enemy'?'OPPONENT ACTING':'WAIT FOR YOUR TURN'}</small></button><button disabled={!ready||!legal({type:'guard'})} onClick={()=>void act({type:'guard'})}><Shield/><b>DEFEND</b><small>{lead?`${duelStats(lead.cardId).defense} DEF · +1 HYPE${tactical?' · END TURN':''}`:'SUMMON FIRST'}</small></button><button className={lead&&lead.charge>=3?'is-special-ready-btn':''} disabled={!ready||!lead} aria-haspopup="dialog" onMouseEnter={()=>setHint(specialDescription)} onFocus={()=>setHint(specialDescription)} onClick={()=>setSpecialOpen(true)}><Zap/><b>INSPECT SPECIAL</b><small>{lead?`${lead.charge}/3 HYPE · ${lead.charge>=3?'READY TO FIRE!':'SEE EFFECT'}`:'DEPLOY FIRST'}</small></button></div>{lead&&<p className="duel-special-summary"><b>{CARD_BY_ID[lead.cardId].ability}</b> · {specialDescription} <span>Costs 3 hype and ends your turn.</span></p>}{duos.map(d=><button key={d.id} className="duel-duo" disabled={!ready||!legal({type:'duo',duoId:d.id})} onClick={()=>void act({type:'duo',duoId:d.id})}>DUO · {d.name} · 3 + 1 HYPE</button>)}<div className="duel-aux"><button disabled={!ready||!legal({type:'pass'})} onClick={()=>void act({type:'pass'})}>{tactical?'END TURN WITHOUT FIGHTING →':'PASS / SAVE STARS →'}</button><button disabled={!!training||busy||isPreview||!!cinematic} onClick={()=>setConfirm(true)}><Flag size={13}/> SURRENDER</button><button disabled={busy||(!controller&&!isPreview)} onClick={onLeave}>{training?'EXIT LESSONS':controller?'EXIT PRACTICE':'CHANGE CREW'}</button></div><p className="duel-preview" role="status">{hint||(tactical?'Prepare, then fight. KO: −40 LP. Forecasts exclude hidden traps.':'One action per turn. Forecasts exclude face-down traps. Hover cards for effects.')}</p></section>
   <section className="duel-hand-panel" aria-label="Your spell and trap hand"><header><b>SPELLS &amp; TRAPS</b><button className="duel-view-deck" onClick={()=>setMatchDeckOpen(true)}>VIEW MATCH DECK</button><small>{duel.player.deck.length} DRAW · {duel.player.discard.length} DISCARD {tactical&&!duel.player.deck.length?`· NEXT EMPTY DRAW −${duel.player.fatigue+5} LP`:''}</small></header>{tactical&&selectedTactic&&<div className="duel-tactic-detail" role="status"><TacticArt id={selectedTactic}/><div><b>{tacticType(duelCard(selectedTactic).kind)} · {duelCard(selectedTactic).name} · {duelCard(selectedTactic).cost} ★</b><p>{duelCard(selectedTactic).text} This uses your tactic slot; you can still fight.</p><em className="tactic-flavor-inline">“{duelCard(selectedTactic).flavor}”</em>{unavailable({type:'play',cardId:selectedTactic})&&<small className="tactic-unavailable">{unavailable({type:'play',cardId:selectedTactic})}</small>}</div><button ref={tacticConfirm} className="button magenta small" disabled={!ready||!legal({type:'play',cardId:selectedTactic})} onClick={()=>void act({type:'play',cardId:selectedTactic})}>{duel.player.tacticUsed?'TACTIC ALREADY USED':duel.player.stars<duelCard(selectedTactic).cost?'NEED MORE STARS':duelCard(selectedTactic).kind==='spell'?'PLAY SPELL':'SET TRAP'}</button><button aria-label="Close card inspection" onClick={()=>setSelectedTactic(null)}>×</button></div>}<div className="duel-hand">{Array.from(new Set(duel.player.hand)).map(id=>{const card=duelCard(id),action:BattleAction={type:'play',cardId:id};return <button key={id} className={`duel-hand-card ${card.kind} ${selectedTactic===id?'selected':''}`} aria-label={`Inspect ${card.name}`} aria-pressed={selectedTactic===id} disabled={tactical?false:!ready||!legal(action)} onClick={()=>tactical?setSelectedTactic(id):void act(action)} onMouseEnter={()=>setHint(`${card.name}: ${card.text}`)} onFocus={()=>setHint(`${card.name}: ${card.text}`)}><header><strong>{card.cost} ★</strong><b>{card.name}{duel.player.hand.filter(c=>c===id).length>1&&<small> ×{duel.player.hand.filter(c=>c===id).length}</small>}</b></header><TacticArt id={id}/><p>{card.text}</p><small>{tactical?card.kind==='spell'?'INSPECT → PLAY':'INSPECT → SET':card.kind==='spell'?'PLAY & END TURN':'SET & END TURN'}</small></button>;})}</div></section>
   <aside className="duel-log"><h2 className="tape yellow">BATTLE LOG</h2>{!last&&<p>{tactical?'Your lead is ready. Play a tactic or deploy if useful, then choose a battle action.':'Six stars. Three residents. Summon someone terrible.'}</p>}<div role="log" aria-label="Battle events">{[...match.events].reverse().slice(0,10).map(e=><p key={e.step}><b>{e.side==='player'?'YOU':'CITY'} · {e.title}</b>{e.text}</p>)}</div></aside>
  </div>}
  {opponent&&!finished&&<p className="duel-opponent-note">OPPOSING FRONTLINE: {CARD_BY_ID[opponent.cardId].name} · {opponent.stance==='defense'?`${duelStats(opponent.cardId).defense} DEF ACTIVE`:'ATTACK STANCE'}{opponent.guard?` · ${opponent.guard*100}% TEMPORARY SHIELD`:''} · AI DECK: {enemyRecipe.name.toUpperCase()}</p>}
  {matchDeckOpen&&<Dialog wide title="YOUR MATCH DECK / FIXED AT START" onClose={()=>setMatchDeckOpen(false)}><p className="match-deck-copy">These are the {tactical?'twelve':'eight'} tactics you brought to this duel. Your hand, draw pile, discard and set trap together contain these cards. Changes in Build Deck apply to your next match.</p><div className="tactic-catalogue">{DUEL_CARDS.filter(c=>allTactics(duel.player).includes(c.id)).map(c=><div className="match-deck-entry" key={c.id}><TacticCard id={c.id}/><b>×{allTactics(duel.player).filter(id=>id===c.id).length} COPIES</b></div>)}</div></Dialog>}
  {specialOpen&&<Dialog title={lead?CARD_BY_ID[lead.cardId].ability.toUpperCase():'FIGHTER SPECIAL'} onClose={()=>setSpecialOpen(false)}><p>{specialDescription}</p>{specialForecast&&<p><b>FORECAST: {specialForecast.damage} HP DAMAGE · {specialForecast.lpDamage} LP DAMAGE{specialForecast.heal?` · ${specialForecast.heal} HP RESTORED`:''}</b><br/>Hidden enemy traps can change this result.</p>}<p>Spend 3 hype. This ends your turn.{lead&&lead.charge<3?` You have ${lead.charge}/3 hype. Attack or defend to build more.`:''}</p><button className="button magenta" disabled={!ready||!legal({type:'ability'})} onClick={()=>{setSpecialOpen(false);void act({type:'ability'});}}>USE SPECIAL · 3 HYPE · END TURN</button><button className="button paper" onClick={()=>setSpecialOpen(false)}>KEEP PLANNING</button></Dialog>}
  {cinematic&&<SpecialCinematic key={cinematic.key} playback={cinematic} mode={cinematicMode} onComplete={()=>setCompletedStep(match.step)}/>}
  {confirm&&<Dialog title="SURRENDER THIS DUEL?" onClose={()=>setConfirm(false)}><p>{controller?'This ends only this practice duel. Your account is unchanged.':'This records a loss. Your cards stay in your collection.'}</p><button className="button magenta" disabled={busy} onClick={async()=>{if(await (controller?controller.surrender():run({type:'battle-surrender',matchId:match.id})))setConfirm(false);}}>SURRENDER</button><button className="button paper" onClick={()=>setConfirm(false)}>KEEP FIGHTING</button></Dialog>}
 </section>;
}
