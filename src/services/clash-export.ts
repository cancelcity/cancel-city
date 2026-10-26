import {CARD_BY_ID,type Card} from '../data/cards';
import type {FirstClashResult} from '../domain/first-clash';
import {clashPlainText,clashVerdictFilename,wrapClashText} from './clash-export-text';

const INK='#0e0b0e',PAPER='#eee4c9',PINK='#ff169e',ACID='#e5ff00';
const DISPLAY='CityCondensed, Impact, "Arial Narrow", sans-serif';

async function loadPortrait(card:Card){
 const source=new URL(card.art,window.location.origin);
 if(source.origin!==window.location.origin)throw new Error('This portrait is unavailable for image export.');
 return new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.decoding='async';image.onload=()=>image.naturalWidth?resolve(image):reject(new Error('A portrait could not be loaded.'));image.onerror=()=>reject(new Error('A portrait could not be loaded. Try preparing the image again.'));image.src=source.href;});
}

function textBox(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,width:number,height:number,{size=40,min=18,color=PAPER,display=false}:{size?:number;min?:number;color?:string;display?:boolean}={}){
 let fontSize=size,lines:string[]=[];
 const family=display?DISPLAY:'Arial, Helvetica, sans-serif';
 for(;fontSize>=min;fontSize--){ctx.font=`${display?'400':'700'} ${fontSize}px ${family}`;lines=wrapClashText(value,width,text=>ctx.measureText(text).width);if(lines.length*fontSize*1.2<=height)break;}
 fontSize=Math.max(min,fontSize);ctx.font=`${display?'400':'700'} ${fontSize}px ${family}`;
 const count=Math.max(1,Math.floor(height/(fontSize*1.2)));
 if(lines.length>count){lines=lines.slice(0,count);let last=lines[count-1]||'';while(last&&ctx.measureText(`${last}…`).width>width)last=Array.from(last).slice(0,-1).join('');lines[count-1]=`${last}…`;}
 ctx.fillStyle=color;ctx.textAlign='left';ctx.textBaseline='top';lines.forEach((line,index)=>ctx.fillText(line,x,y+index*fontSize*1.2));
}

function panel(ctx:CanvasRenderingContext2D,x:number,y:number,width:number,height:number,fill:string,stroke=PAPER){
 ctx.fillStyle=INK;ctx.fillRect(x+7,y+9,width,height);ctx.fillStyle=fill;ctx.fillRect(x,y,width,height);ctx.strokeStyle=stroke;ctx.lineWidth=4;ctx.strokeRect(x,y,width,height);
}

function portrait(ctx:CanvasRenderingContext2D,image:HTMLImageElement,card:Card,x:number,y:number,tone:string,label:string){
 panel(ctx,x,y,446,363,PAPER,tone);
 const ratio=Math.max(434/image.naturalWidth,300/image.naturalHeight),width=434/ratio,height=300/ratio;
 ctx.drawImage(image,(image.naturalWidth-width)/2,Math.max(0,(image.naturalHeight-height)*.2),width,height,x+6,y+6,434,300);
 ctx.fillStyle=INK;ctx.fillRect(x+6,y+306,434,51);
 textBox(ctx,`${label} / ${card.name.toUpperCase()}`,x+18,y+316,410,34,{size:29,min:19,color:tone,display:true});
}

/** Uses existing character art and browser canvas only; nothing is uploaded. */
export async function createClashVerdictFile(result:FirstClashResult,challengeUrl:string){
 const actor=CARD_BY_ID[result.actorId],opponent=CARD_BY_ID[result.opponentId];
 if(!actor||!opponent)throw new Error('The characters for this verdict could not be found.');
 const [actorImage,opponentImage]=await Promise.all([loadPortrait(actor),loadPortrait(opponent),document.fonts?Promise.all([document.fonts.load(`56px ${DISPLAY}`),document.fonts.ready]).catch(()=>undefined):Promise.resolve()]);
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Image export is unavailable in this browser.');
 ctx.fillStyle=INK;ctx.fillRect(0,0,1080,1350);
 ctx.strokeStyle=PAPER;ctx.lineWidth=6;ctx.strokeRect(19,19,1042,1312);
 // Offset print dots and diagonal ink cuts give the poster its comic stock.
 ctx.fillStyle='#30222b';for(let row=0;row<18;row++)for(let col=0;col<30;col++){ctx.beginPath();ctx.arc(35+col*37+(row%2)*18,227+row*25,3,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle=PINK;ctx.beginPath();ctx.moveTo(37,42);ctx.lineTo(486,36);ctx.lineTo(466,94);ctx.lineTo(44,102);ctx.closePath();ctx.fill();
 textBox(ctx,'CANCEL CITY / FIRST CLASH',59,51,400,42,{size:38,color:INK,display:true});
 textBox(ctx,'ONE EXCHANGE / YOUR VERDICT',618,61,400,38,{size:26,color:PAPER,display:true});
 textBox(ctx,result.verdict.toUpperCase(),54,123,974,107,{size:82,min:38,color:ACID,display:true});
 portrait(ctx,actorImage,actor,54,244,ACID,'YOU');
 portrait(ctx,opponentImage,opponent,580,244,PINK,'THE PROBLEM');
 ctx.fillStyle=INK;ctx.beginPath();ctx.arc(540,421,54,0,Math.PI*2);ctx.fill();ctx.strokeStyle=PAPER;ctx.lineWidth=4;ctx.stroke();textBox(ctx,'VS',513,390,58,59,{size:60,color:PAPER,display:true});
 textBox(ctx,opponent.name.toUpperCase(),59,634,940,27,{size:23,color:PINK,display:true});
 textBox(ctx,`“${clashPlainText(result.setup)}”`,59,670,962,109,{size:35,min:20});
 panel(ctx,54,800,972,201,PAPER,PINK);
 textBox(ctx,`YOUR REPLY / ${result.tone.toUpperCase()}`,74,815,930,31,{size:24,color:'#9e005b',display:true});
 textBox(ctx,`“${clashPlainText(result.reply)}”`,74,855,930,124,{size:43,min:21,color:INK});
 textBox(ctx,'THE COMEBACK',59,1028,950,27,{size:23,color:PINK,display:true});
 textBox(ctx,`“${clashPlainText(result.retort)}”`,59,1065,962,112,{size:32,min:19});
 ctx.fillStyle=ACID;ctx.fillRect(39,1201,1002,5);
 textBox(ctx,'THINK YOU HAVE A BETTER REPLY? TAKE THE SAME CLASH.',59,1224,962,38,{size:30,min:24,color:ACID,display:true});
 textBox(ctx,challengeUrl.replace(/^https?:\/\//,''),59,1272,960,40,{size:20,min:13,color:PAPER});
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('The verdict image could not be created.')),'image/png'));
 return new File([blob],clashVerdictFilename(result.id),{type:'image/png'});
}

export function downloadClashVerdict(file:File){
 const url=URL.createObjectURL(file),link=document.createElement('a');link.href=url;link.download=file.name;document.body.appendChild(link);
 try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
}
