import {CARD_BY_ID} from '../data/cards';
import {formatReward,type RewardPresentation} from '../domain/rewards';

export function RewardSummary({reward,compact=false}:{reward:RewardPresentation;compact?:boolean}){
 return <section className={`reward-summary ${compact?'is-compact':''}`} aria-label={reward.title}>
  <h3>{reward.title}</h3>
  {reward.lines.length>0&&<dl>{reward.lines.map((line,i)=><div key={`${line.label}-${i}`}><dt>{line.label}</dt><dd>{formatReward(line.amounts)}</dd></div>)}</dl>}
  <p>{reward.note}</p>
  {reward.lines.some(line=>(line.amounts.tickets??0)>0)&&<p className="reward-unit-note">1 ticket = 1 pack of 5 fighters. XP raises your cosmetic level, without changing combat stats.</p>}
  {reward.mastery&&reward.mastery.length>0&&<details><summary>FIGHTER MASTERY · 3 &amp; 10 WINS</summary><ul>{reward.mastery.map(f=><li key={f.cardId}><b>{CARD_BY_ID[f.cardId]?.name??f.cardId}</b><span>{f.nextThreshold===null?'Both rewards earned':f.remaining===0?`${f.wins} wins · next win collects a pending milestone`:`${f.wins} wins · ${f.remaining} more for 1 ticket + 20 XP`}</span></li>)}</ul></details>}
 </section>;
}
