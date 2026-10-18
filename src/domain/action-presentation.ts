import type {BattleEvent} from './battle';
import type {SceneTiming} from './cinematic';
export function actionTiming(kind:BattleEvent['kind']|undefined):SceneTiming {
 const full=kind==='guard'?820:kind==='switch'?900:1180;
 const impact=kind==='guard'?420:kind==='switch'?450:700;
 return {full,impact,short:Math.round(full*.68),shortImpact:Math.round(impact*.68),reduced:0,reducedImpact:0,normal:full};
}
