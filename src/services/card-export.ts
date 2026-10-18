import {Card,rarityOf,setOf} from '../data/cards';
export async function downloadCard(card:Card,foil:boolean){
 const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Portrait could not be loaded. Try again.'));img.src=card.art;});
 const canvas=document.createElement('canvas');canvas.width=800;canvas.height=1100;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Card image export is unavailable in this browser.');
 ctx.fillStyle='#080808';ctx.fillRect(0,0,800,1100);ctx.fillStyle='#e8dfc8';ctx.fillRect(12,12,776,1076);
 ctx.fillStyle='#0b0b0b';let size=44;ctx.font=`bold ${size}px Arial`;while(ctx.measureText(card.name).width>690&&size>20){size--;ctx.font=`bold ${size}px Arial`;}ctx.fillText(card.name,36,72);
 ctx.drawImage(image,28,94,744,744);ctx.strokeStyle='#080808';ctx.lineWidth=5;ctx.strokeRect(28,94,744,744);
 if(foil){const gradient=ctx.createLinearGradient(28,94,772,838);gradient.addColorStop(0,'#ffdd8844');gradient.addColorStop(.35,'#20dfff33');gradient.addColorStop(.65,'#ff20aa44');gradient.addColorStop(1,'#deff0033');ctx.fillStyle=gradient;ctx.fillRect(28,94,744,744);ctx.fillStyle='#ff169e';ctx.fillRect(615,105,145,42);ctx.fillStyle='#080808';ctx.font='bold 26px Arial';ctx.fillText('FOIL ✦',629,135);}
 ctx.fillStyle='#080808';ctx.beginPath();ctx.arc(66,823,37,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e8dfc8';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 36px Arial';ctx.textAlign='center';ctx.fillText(String(Math.max(1,Math.round(card.stats.clout/10))),66,836);
 ctx.fillStyle=rarityOf(card.rarity).color;ctx.fillText('◆',736,835);ctx.fillStyle='#080808';ctx.font='bold 26px Arial';ctx.fillText(rarityOf(card.rarity).name.toUpperCase(),400,879);
 ctx.font='italic 21px Arial';const quote=`“${card.quote}”`,words=quote.split(' ');let line='',y=918;for(const word of words){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>688&&line){ctx.fillText(line,400,y);y+=27;line=word;}else line=next;}ctx.fillText(line,400,y);
 ctx.font='bold 18px Arial';ctx.fillText(card.ability.toUpperCase(),400,1008);ctx.fillStyle='#ff169e';ctx.fillRect(22,1036,756,41);ctx.fillStyle='#080808';ctx.font='bold 19px Arial';ctx.fillText(`CANCEL CITY · #${String(card.number).padStart(3,'0')} · ${`SET ${setOf(card).slice(-2)}`}`,400,1064);
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Card image could not be created.')),'image/png'));
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`cancel-city-${card.id.toLowerCase()}${foil?'-foil':''}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
