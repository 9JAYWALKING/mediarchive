// Keep sentences together when possible, then break long sentences at word boundaries.
export function splitDialogue(text,limit=72){
 const value=String(text??'').replace(/\s+/gu,' ').trim();if(!value)return [];
 const chunks=[];let buffer='';
 const flush=()=>{if(buffer)chunks.push(buffer);buffer='';};
 for(const sentence of value.split(/(?<=[.!?。！？])\s+/u)){
  if([...sentence].length<=limit){
   if(buffer&&[...buffer].length+1+[...sentence].length>limit)flush();
   buffer+=(buffer?' ':'')+sentence;continue;
  }
  flush();let remaining=[...sentence];
  while(remaining.length>limit){
   let cut=remaining.slice(0,limit+1).lastIndexOf(' ');if(cut<Math.floor(limit/3))cut=limit;
   chunks.push(remaining.slice(0,cut).join('').trim());remaining=remaining.slice(cut);while(remaining[0]===' ')remaining.shift();
  }
  buffer=remaining.join('');
 }
 flush();return chunks;
}
export function createDialoguePager(limit=58){
 let pages=[],index=0;
 return {set(text){pages=splitDialogue(text,limit);index=0;},next(){if(index>=pages.length-1)return false;index++;return true;},get text(){return pages[index]||'';},get hasNext(){return index<pages.length-1;},get index(){return index;},get total(){return pages.length;}};
}
