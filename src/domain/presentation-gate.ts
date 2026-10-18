/** Shared by video and fallback so a media failure can never apply a result twice. */
export class PresentationGate {
 private hit=false;
 private done=false;
 impact(callback:()=>void){if(this.hit||this.done)return;this.hit=true;callback();}
 complete(impact:()=>void,complete:()=>void){if(this.done)return;this.impact(impact);this.done=true;complete();}
}
