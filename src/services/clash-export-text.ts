/** Canvas text stays plain text: no HTML parsing, and no hidden control characters. */
export function clashPlainText(value:string){return value.replace(/[\u0000-\u001f\u007f-\u009f]/g,' ').replace(/\s+/g,' ').trim();}

/** Break even an unspaced URL or long word, without silently losing characters. */
export function wrapClashText(value:string,maxWidth:number,measure:(text:string)=>number){
 const text=clashPlainText(value),lines:string[]=[];
 if(!text)return lines;
 if(maxWidth<=0)throw new Error('A text box needs positive width.');
 let line='';
 for(const word of text.split(' ')){
  if(measure(line?`${line} ${word}`:word)<=maxWidth){line=line?`${line} ${word}`:word;continue;}
  if(line){lines.push(line);line='';}
  for(const char of Array.from(word)){
   if(line&&measure(line+char)>maxWidth){lines.push(line);line='';}
   line+=char;
  }
 }
 if(line)lines.push(line);
 return lines;
}

export function clashChallengeUrl(seed:string,base:string){
 const source=new URL(base);
 if(!['https:','http:'].includes(source.protocol))throw new Error('A challenge needs a web address.');
 const url=new URL('/',source.origin);url.searchParams.set('clash',seed);return url.toString();
}

export function clashVerdictFilename(id:string){return `cancel-city-clash-${id.toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').slice(0,64)||'verdict'}.png`;}
