import {defaultStudents} from './planner-catalog.js?v=20261115akariVoice1';
const owners=new Set(defaultStudents.map(s=>s.id));
// Guidance has its own ledger; bond invitations and ordinary review DMs keep their existing IDs.
export function normalizeGuideMessages(raw){
 const messages=new Map();
 for(const m of Array.isArray(raw)?raw.slice(-600):[]){
  if(!m||typeof m.id!=='string'||m.id.length>180||!owners.has(m.student)||typeof m.text!=='string'||!m.text.trim()||!Number.isFinite(m.at)||m.at<0)continue;
  const old=messages.get(m.id),value={id:m.id,student:m.student,text:m.text.slice(0,1400),at:m.at,kind:['invite','start','check','result','meal','notice'].includes(m.kind)?m.kind:'notice',readAt:Number.isFinite(m.readAt)?Math.max(0,m.readAt):0};
  if(!old||old.at<=value.at)messages.set(m.id,{...value,readAt:Math.max(old?.readAt||0,value.readAt)});
 }
 return [...messages.values()].sort((a,b)=>a.at-b.at).slice(-300);
}
export function mergeGuideMessages(a,b){return normalizeGuideMessages([...(a||[]),...(b||[])]);}
export function guideMessageForCard(card){
 const kind={study:'invite',plan:'invite',check:'check',meal:'meal'}[card?.kind];
 if(!kind||!card.noticeId||!owners.has(card.student)||!card.text)return null;
 return {id:card.noticeId,student:card.student,kind,text:[card.text,card.goal].filter(Boolean).join(' ')};
}
export function guideUnread(messages,card,student){
 // Only today's actionable card carries a guidance badge. Old invitations remain readable history.
 if(!card||!['study','plan','check','meal'].includes(card.kind)||(student&&card.student!==student))return 0;
 return messages.some(m=>m.id===card.noticeId&&!m.readAt)?1:0;
}
