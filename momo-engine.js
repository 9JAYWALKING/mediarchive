import {schedule} from './schedule-data.js';
import {koreanDate,validDate,shiftDate} from './game-state.js';
import {routineContext} from './routine-engine.js';
export const momoOwners={haru:[1,2,6],nagi:[3,4,5,7],shiori:[8,9,10,11,12,13],rei:[14,15,16,17]};
const M=60000,DAY=86400000;
const owned=(student,lecture)=>momoOwners[student]?.includes(lecture);
const finite=t=>Number.isFinite(t)&&t>=0;
export function normalizeMomo(raw){
 const messages=new Map(),plans=new Map();
 for(const m of Array.isArray(raw?.messages)?raw.messages.slice(-2000):[]){
  if(!m||typeof m.id!=='string'||!m.id.length||m.id.length>120||!owned(m.student,m.lecture)||!finite(m.at))continue;
  const value={id:m.id,student:m.student,lecture:m.lecture,at:m.at,readAt:finite(m.readAt)?m.readAt:0};
  const old=messages.get(m.id);if(!old||value.readAt>=old.readAt)messages.set(m.id,value);
 }
 for(const p of Array.isArray(raw?.plans)?raw.plans.slice(-2000):[]){
  const m=messages.get(p?.messageId);
  if(!m||p.id!==`plan:${m.id}`||!validDate(p.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.time)||!Number.isInteger(p.minutes)||p.minutes<5||p.minutes>720||!['scheduled','done','canceled'].includes(p.status)||!finite(p.createdAt)||!finite(p.updatedAt))continue;
  const value={id:p.id,messageId:m.id,student:m.student,lecture:m.lecture,date:p.date,time:p.time,minutes:p.minutes,status:p.status,createdAt:p.createdAt,updatedAt:p.updatedAt};
  if(!plans.has(p.id)||plans.get(p.id).updatedAt<=p.updatedAt)plans.set(p.id,value);
 }
 return {version:1,messages:[...messages.values()].sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id)),plans:[...plans.values()].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))};
}
export function mergeMomo(a,b){return normalizeMomo({messages:[...(a?.messages||[]),...(b?.messages||[])],plans:[...(a?.plans||[]),...(b?.plans||[])]});}
export const planStart=p=>Date.parse(`${p.date}T${p.time}:00+09:00`);
function lastStudy(lecture,study){return Math.max(0,...(study?.memories||[]).filter(m=>m.context?.lecture===lecture&&m.duration>=300000).map(m=>Date.parse(m.date)).filter(Number.isFinite));}
export function deliverMomo(raw,study,examDate,now=Date.now()){
 const state=normalizeMomo(raw),ctx=routineContext(now);
 if(ctx.minute<390||ctx.minute>=1320||(validDate(examDate)&&koreanDate(now)>examDate))return state;
 const first=!state.messages.length,lastMessage=Math.max(0,...state.messages.map(m=>m.at));
 if(!first&&now-lastMessage<4*3600000)return state;
 for(const [student,ids] of Object.entries(momoOwners)){
  const history=state.messages.filter(m=>m.student===student),last=history.at(-1);
  if(last&&(!last.readAt||now-last.at<DAY))continue;
  if(state.plans.some(p=>p.student===student&&p.status==='scheduled'))continue;
  // Do not stack another invitation on an unanswered one.
  if(last&&!state.plans.some(p=>p.messageId===last.id&&p.status!=='scheduled'))continue;
  const candidates=schedule.filter(l=>ids.includes(l.id)).map(l=>{
   const end=Date.parse(`${l.date}T${l.time}:00+09:00`)+l.hours*3600000;
   const review=Math.max(lastStudy(l.id,study),...state.plans.filter(p=>p.lecture===l.id&&p.status==='done').map(p=>p.updatedAt),0);
   return {l,end,review};
  }).filter(x=>now-x.end>=DAY&&(!x.review||now-x.review>=2*DAY)&&!state.plans.some(p=>p.lecture===x.l.id&&p.status==='scheduled')).sort((a,b)=>(a.review||a.end)-(b.review||b.end));
  if(!candidates.length)continue;
  const lecture=candidates[0].l.id,id=`${student}:${lecture}:${koreanDate(now)}`;
  if(state.messages.some(m=>m.id===id))continue;
  state.messages.push({id,student,lecture,at:now,readAt:0});if(!first)break;
 }
 return normalizeMomo(state);
}
export function planError(plan,plans,now=Date.now(),meals=null){
 if(!validDate(plan.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(plan.time)||![15,30,45,60].includes(plan.minutes))return '날짜와 시간을 확인해 줘.';
 const start=planStart(plan),end=start+plan.minutes*M;
 if(start<now)return '지금 이후의 시간으로 골라 줘.';
 for(let t=start;t<end;t+=M){if(!['morning','review','evening'].includes(routineContext(t,undefined,meals).phase))return '수업·식사·휴식 시간을 피해 골라 줘.';}
 if(plans.some(p=>p.id!==plan.id&&p.status==='scheduled'&&start<planStart(p)+p.minutes*M&&end>planStart(p)))return '그 시간에는 다른 약속이 있어.';
 return '';
}
export function suggestPlan(plans,now=Date.now(),minutes=30,meals=null){
 for(let d=0;d<14;d++){
  const date=shiftDate(koreanDate(now),d);
  for(let m=390;m+minutes<=1320;m+=15){
   const proposal={date,time:`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`,minutes};
   if(!planError(proposal,plans,now,meals))return proposal;
  }
 }
 return null;
}
export function scheduleMomo(raw,messageId,proposal,now=Date.now()){
 const state=normalizeMomo(raw),message=state.messages.find(m=>m.id===messageId);if(!message)return {error:'메시지를 찾지 못했어.'};
 const old=state.plans.find(p=>p.messageId===messageId);
 if(old?.status==='done')return {error:'이미 마친 약속이야.'};
 const p={...proposal,id:`plan:${messageId}`,messageId,student:message.student,lecture:message.lecture,status:'scheduled',createdAt:old?.createdAt||now,updatedAt:now};
 const error=planError(p,state.plans,now);if(error)return {error};
 return {state:normalizeMomo({...state,plans:[...state.plans.filter(x=>x.id!==p.id),p]})};
}
export const momoCopy={
 haru:{hello:'잘 지내? 내 옆자리 너무 오래 비어 있는 거 아냐?',invite:'지난 강의, 다시 펼쳐 볼래? 헷갈린 데부터 같이 보자. 내가 먼저 기다리고 있을게!',reply:'좋아, 그때 보자!',accept:'약속! 헤헤, 이번엔 내가 먼저 와 있을 거야.',done:'와 줬네! 다음에도 또 같이 하자.',cancel:'괜찮아! 시간 나면 다시 불러 줘.'},
 nagi:{hello:'잘 지내…? 그냥, 네 생각이 나서.',invite:'전에 봤던 거… 천천히 다시 볼까? 잊은 데가 있어도 괜찮아.',reply:'응, 같이 보자.',accept:'응… 그 시간 비워 둘게. 기다릴게.',done:'같이 봐 줘서 고마워. 혼자보다 좋았어.',cancel:'응, 괜찮아. 편할 때 다시 정하자…'},
 shiori:{hello:'잘 지내? 네 책갈피, 아직 여기 있어.',invite:'지난번 범위에 빈칸이 남았는지 같이 확인하자. 시간은 네가 골라.',reply:'시간 잡아 둘게.',accept:'적어 뒀어. …펜은 내가 두 개 챙길게.',done:'약속 하나 완료. 책갈피는 다음에 또 쓰자.',cancel:'일정에서 빼 둘게. 다른 날로 옮겨도 돼.'},
 rei:{hello:'잘 지내? 별일 없지? …확인하고 싶어서.',invite:'전에 본 부분을 다시 비교해 보면 좋겠어. 잠깐 시간 낼 수 있어?',reply:'응, 그때 갈게.',accept:'알겠어. 자리는 비워 둘게. 늦더라도 연락은 해.',done:'수고했어. 네가 와서… 도움이 됐어.',cancel:'알겠어. 무리해서 오지는 마. 다시 정하면 돼.'}
};
