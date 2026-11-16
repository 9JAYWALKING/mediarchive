import {studyDays,routeUnit,routeDayUnits,routeRevision,routeHours,learningBaseline,routeUnits} from './study-route-data.js?v=20261116tempo1';
import {schedule} from './schedule-data.js?v=20261116guideDM2';
import {koreanDate} from './game-state.js';
export const routeKey='mediarchive-study-route-v1';
export const minute=s=>Number(s.slice(0,2))*60+Number(s.slice(3));
export const clock=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(Math.floor(m%60)).padStart(2,'0')}`;
export const dayMinute=now=>(now-Date.parse(koreanDate(now)+'T00:00:00+09:00'))/60000;
export function normalizeRoute(raw){
 const out={version:1,checks:{},questDays:{},questHistory:{},order:{},extraDates:[],mealDeferrals:{},meals:[],activeMeal:null,restUntil:0,reviewed:[],signals:[],enabled:raw?.enabled!==false};
 for(const day of studyDays){const saved=raw?.questDays?.[day.date];if(!saved||!Array.isArray(saved.items))continue;
  const seen=new Set(),items=[];
  for(const q of saved.items.slice(0,100)){if(!q||routeUnit(q.unitId)?.date!==day.date||typeof q.id!=='string'||!q.id.startsWith(day.date+':')||q.id.length>120||seen.has(q.id)||!Number.isFinite(q.minutes)||q.minutes<1||q.minutes>180||!Number.isFinite(q.start)||!Number.isFinite(q.end)||q.start<420||q.end>1440||q.end<=q.start)continue;seen.add(q.id);items.push({id:q.id,unitId:q.unitId,minutes:q.minutes,start:q.start,end:q.end});}
  if(!items.length)continue;const done={};for(const q of items)if(Number.isFinite(saved.done?.[q.id])&&saved.done[q.id]>0)done[q.id]=saved.done[q.id];
  out.questDays[day.date]={items,done,...(saved.revision===routeRevision?{revision:routeRevision}:{})};
 }
 for(const day of studyDays){const old=raw?.questHistory?.[day.date];if(old){const clean=normalizeRoute({questDays:{[day.date]:old}}).questDays[day.date];if(clean)out.questHistory[day.date]=clean;}const ids=new Set(out.questDays[day.date]?.items.map(q=>q.id)||[]);out.order[day.date]=[...new Set(Array.isArray(raw?.order?.[day.date])?raw.order[day.date]:[])].filter(id=>ids.has(id)).slice(0,100);}
 out.extraDates=[...new Set(Array.isArray(raw?.extraDates)?raw.extraDates:[])].filter(date=>studyDays.some(d=>d.date===date));
 for(const [id,c] of Object.entries(raw?.checks||{}).slice(0,1000))if(routeUnit(id)&&c&&['again','clear','partial'].includes(c.rating)&&Number.isFinite(c.at))out.checks[id]={rating:c.rating,at:c.at,done:c.done===true,...(Number.isInteger(c.lecture)&&c.lecture>=1&&c.lecture<=53?{lecture:c.lecture}:{})};
 out.meals=(Array.isArray(raw?.meals)?raw.meals:[]).filter(m=>m&&Number.isFinite(m.start)&&Number.isFinite(m.end)&&m.end>=m.start&&m.end-m.start<=86400000&&['lunch','dinner','other'].includes(m.kind)).slice(-100);
 for(const [key,until] of Object.entries(raw?.mealDeferrals||{}).slice(-40))if(/^2026-11-\d{2}:(lunch|dinner)$/.test(key)&&Number.isFinite(until)&&until>=0)out.mealDeferrals[key]=until;
 const a=raw?.activeMeal;if(a&&Number.isFinite(a.start)&&['lunch','dinner','other'].includes(a.kind))out.activeMeal={start:a.start,kind:a.kind};
 if(Number.isFinite(raw?.restUntil))out.restUntil=raw.restUntil;
 out.reviewed=(Array.isArray(raw?.reviewed)?raw.reviewed:[]).filter(s=>typeof s==='string'&&s.length<160).slice(-2000);
 out.signals=(Array.isArray(raw?.signals)?raw.signals:[]).filter(s=>typeof s==='string'&&s.length<200).slice(-300);
 return out;
}
function mergeLedger(a,b){if(!a)return b;if(!b)return a;const done={...a.done};for(const [id,at] of Object.entries(b.done))done[id]=Math.max(done[id]||0,at);return {...a,items:[...new Map([...a.items,...b.items].map(q=>[q.id,q])).values()],done};}
export function mergeRoute(a,b){
 const left=normalizeRoute(a),right=normalizeRoute(b);
 for(const [id,c] of Object.entries(right.checks))if(!left.checks[id]||left.checks[id].at<c.at)left.checks[id]=c;
 for(const [key,until] of Object.entries(right.mealDeferrals))left.mealDeferrals[key]=Math.max(left.mealDeferrals[key]||0,until);
 for(const [date,day] of Object.entries(right.questDays)){
  const saved=left.questDays[date];if(!saved){left.questDays[date]=day;continue;}
  if(saved.revision===day.revision){left.questDays[date]=mergeLedger(saved,day);continue;}
  const current=saved.revision===routeRevision?saved:day,old=current===saved?day:saved;
  left.questHistory[date]=mergeLedger(left.questHistory[date],old);
  left.questDays[date]=mergeLedger(current,{...old,items:old.items.filter(q=>old.done[q.id])});
 }
 for(const [date,day] of Object.entries(right.questHistory))left.questHistory[date]=mergeLedger(left.questHistory[date],day);
 left.reviewed=[...new Set([...left.reviewed,...right.reviewed])];left.meals=[...new Map([...left.meals,...right.meals].map(m=>[m.start,m])).values()];return normalizeRoute(left);
}
export function unitMinutes(unit,planner,now=Date.now()){
 const ids=new Set(planner.plans.filter(p=>p.sourceId==='guide:'+unit.id).map(p=>p.id));
 const saved=planner.records.filter(r=>ids.has(r.planId)).reduce((sum,r)=>sum+r.duration,0),f=planner.focus;
 return (saved+(f&&ids.has(f.planId)?f.elapsed+(f.started?Math.max(0,Math.min(now,f.stopAt||now)-f.started):0):0))/60000;
}
export function routeFocus(planner){const p=planner.plans.find(p=>p.id===planner.focus?.planId);const u=p?.sourceId?.startsWith('guide:')?routeUnit(p.sourceId.slice(6)):null;return u?{...u,lecture:p.lecture,student:p.student,title:p.title,goal:p.note,material:p.track,questId:p.questId||''}:null;}
// Assigned cards have stable identities. Timer records never complete or add quests.
export function assignRouteQuests(date,state,planner,{lessons=schedule,now=Date.now()}={}){
 const existing=state.questDays?.[date],day=studyDays.find(d=>d.date===date);
 if(!day||existing?.revision===routeRevision)return state;
 // Finish an existing clock with its original IDs before replacing its pending roster.
 if(existing&&planner.focus&&planner.plans.some(p=>p.id===planner.focus.planId&&p.date===date&&p.sourceId?.startsWith('guide:')))return state;
 const cleanState={...normalizeRoute(null),enabled:state.enabled};
 const cleanPlanner={...planner,focus:null,records:[],plans:planner.plans.filter(p=>p.status!=='canceled'&&!p.sourceId?.startsWith('guide:')).map(p=>({...p,status:'scheduled'}))};
 const baseline=buildRoute(date,cleanState,cleanPlanner,{now,lessons,fromNow:false});
 const retained=(existing?.items||[]).filter(q=>existing.done[q.id]);
 const items=[...retained,...day.units.filter(u=>!(u.pass===1&&legacyLectureComplete(u.lecture,state))).map(u=>{const slots=baseline.rows.filter(b=>b.kind==='study'&&b.unit.id===u.id);return {id:date+':'+u.id,unitId:u.id,minutes:u.minutes,start:slots[0]?.start??routeHours.end-1,end:slots.at(-1)?.end??routeHours.end};})];
 if(!items.length)return state;
 return {...state,questHistory:{...state.questHistory,...(existing?{[date]:existing}:{})},order:{...state.order,[date]:[]},questDays:{...state.questDays,[date]:{revision:routeRevision,items,done:{...existing?.done}}}};
}
export function prioritizeRouteQuest(state,date,id){const day=state.questDays?.[date];if(!day?.items.some(q=>q.id===id)||day.done[id])return state;return {...state,order:{...state.order,[date]:[id,...(state.order[date]||[]).filter(q=>q!==id)]},restUntil:0};}
function legacyLectureComplete(lecture,state){return Object.entries(state.checks).some(([id,c])=>!id.startsWith('tempo-')&&routeUnit(id)?.lecture===lecture&&c.done)||Object.values({...state.questHistory,...state.questDays}).some(day=>day.items.some(q=>{const u=routeUnit(q.unitId);if(!u||q.unitId.startsWith('tempo-')||u.lecture!==lecture)return false;const peers=day.items.filter(p=>p.unitId===q.unitId);return peers.every(p=>day.done[p.id])&&peers.reduce((n,p)=>n+p.minutes,0)>=u.minutes;}));}
export function routePassProgress(state){return [1,2,3].map(pass=>({pass,total:53,done:Array.from({length:53},(_,i)=>i+1).filter(lecture=>pass===1&&(learningBaseline.firstPass.includes(lecture)||legacyLectureComplete(lecture,state))||routeUnits.some(u=>u.lecture===lecture&&u.pass===pass&&isUnitComplete(u,state))).length}));}
function isUnitComplete(unit,state){const day=state.questDays?.[unit.date||routeUnit(unit.id)?.date],items=day?.items.filter(q=>q.unitId===unit.id)||[];return items.length>0?items.every(q=>day.done[q.id]):state.checks[unit.id]?.done===true;}
export function routePrerequisite(unit,state){for(let pass=1;pass<(unit.pass||0);pass++){if(pass===1&&(learningBaseline.firstPass.includes(unit.lecture)||legacyLectureComplete(unit.lecture,state)))continue;const previous=routeUnits.find(u=>u.lecture===unit.lecture&&u.pass===pass);if(previous&&!isUnitComplete(previous,state))return previous;}return null;}
export function completeRouteQuest(state,date,id,now=Date.now()){
 const day=state.questDays?.[date];if(!day?.items.some(q=>q.id===id)||day.done[id])return state;
 return {...state,questDays:{...state.questDays,[date]:{...day,done:{...day.done,[id]:now}}}};
}
export function routeQuestProgress(route,state){
 const day=state.questDays?.[route?.day.date],items=day?.items||[];
 const completed=items.filter(q=>day.done[q.id]).map(q=>({...q,title:route.units.find(u=>u.id===q.unitId)?.title||routeUnit(q.unitId)?.title||''}));
 return {done:completed.length,total:items.length,completed};
}
// Keep one visible card per assigned quest even if a class splits its time slots.
export function routeQuestRows(route,state){
 const day=state.questDays?.[route.day.date];if(!day)return route.rows;
 const units=new Map(route.units.map(u=>[u.id,u]));
 const rows=day.items.map(q=>{const slots=route.rows.filter(r=>r.kind==='study'&&r.questId===q.id),done=!!day.done[q.id],unit=units.get(q.unitId)||routeUnit(q.unitId);
  return {kind:'study',questId:q.id,unit:{...unit,questId:q.id},title:unit.title,minutes:q.minutes,start:slots[0]?.start??q.start,end:slots.at(-1)?.end??q.end,slots,done,unplaced:!done&&!slots.length};});
 return [...route.rows.filter(r=>r.kind!=='study'),...rows].sort((a,b)=>(a.done?-1:a.unplaced?1441:a.start)-(b.done?-1:b.unplaced?1441:b.start));
}
function mergeBusy(rows){const result=[];for(const row of [...rows].sort((a,b)=>a.start-b.start)){const prev=result.at(-1);if(prev&&row.start<=prev.end&&row.kind===prev.kind){prev.end=Math.max(prev.end,row.end);prev.title+=' · '+row.title;prev.lectures.push(...(row.lectures||[]));}else result.push({...row,lectures:row.lectures||[]});}return result;}
export function buildRoute(date,state,planner,{now=Date.now(),fromNow=true,lessons=schedule,releasedAt}={}){
 const day=studyDays.find(d=>d.date===date);if(!day)return null;
 const midnight=Date.parse(date+'T00:00:00+09:00'),today=koreanDate(now)===date,current=(now-midnight)/60000;
 const extra=today&&state.extraDates?.includes(date)&&current>=routeHours.end,endOfDay=extra?routeHours.extraEnd:routeHours.end;
 const cursorStart=today&&fromNow?Math.max(420,Math.ceil(current)):420;
 const classRows=lessons.filter(l=>l.date===date).map(l=>({kind:'class',start:minute(l.time),end:minute(l.time)+l.hours*60,title:l.title,lectures:[l.id]})),classes=mergeBusy(classRows);
 const personal=planner.plans.filter(p=>p.date===date&&p.status==='scheduled'&&!p.sourceId?.startsWith('guide:')).map(p=>({kind:'plan',start:minute(p.time),end:minute(p.time)+p.minutes,title:p.title,planId:p.id}));
 const actual=state.meals.filter(m=>koreanDate(m.start)===date).map(m=>({kind:'meal',meal:m.kind,start:(m.start-midnight)/60000,end:(m.end-midnight)/60000,title:m.kind==='dinner'?'저녁':'식사',actual:true}));
 const fixed=[...classes,...personal];
 const activePlan=planner.plans.find(p=>p.id===planner.focus?.planId),activeElapsed=planner.focus?(planner.focus.elapsed+(planner.focus.started?Math.max(0,Math.min(now,planner.focus.stopAt||now)-planner.focus.started):0))/60000:0;
 const activeEnd=today&&activePlan?.sourceId?.startsWith('guide:')?Math.min(endOfDay,current+Math.max(5,(planner.focus.guideMinutes||activePlan.minutes||5)-activeElapsed)):null;
 const mealBusy=[...fixed,...(activeEnd? [{start:current,end:activeEnd}]:[])];
 const mealAt=(proposed,length)=>{let start=proposed;for(let i=0;i<20;i++){const clash=mealBusy.find(b=>start<b.end&&start+length>b.start);if(!clash)return start;start=clash.end;}return start;};
 const morning=classes.filter(c=>c.start<840&&c.end>660),lunch=mealAt(Number.isFinite(releasedAt)?releasedAt:morning.length?Math.max(...morning.map(c=>c.end)):720,45),dinner=mealAt(1080,45);
 const meals=[...actual];
 for(const [kind,start] of [['lunch',lunch],['dinner',dinner]])if(!actual.some(m=>m.meal===kind)&&state.activeMeal?.kind!==kind){let at=Math.max(start,((state.mealDeferrals?.[date+':'+kind]||midnight)-midnight)/60000);if(today&&fromNow&&at<cursorStart)at=mealAt(cursorStart,45);meals.push({kind:'meal',meal:kind,start:at,end:at+45,title:kind==='lunch'?'점심':'저녁',tentative:true});}
 if(state.activeMeal&&koreanDate(state.activeMeal.start)===date)meals.push({kind:'meal',meal:state.activeMeal.kind,start:(state.activeMeal.start-midnight)/60000,end:Math.max(current+30,(state.activeMeal.start-midnight)/60000+50),title:'식사 중',actual:true,active:true});
 // A late lunch must not share the same proposed window with dinner.
 meals.sort((a,b)=>a.start-b.start);for(let i=1;i<meals.length;i++)if(meals[i].tentative&&meals[i].start<meals[i-1].end+90){meals[i].start=mealAt(meals[i-1].end+90,45);meals[i].end=meals[i].start+45;}
 const blocked=[...fixed,...meals].sort((a,b)=>a.start-b.start);
 // Catch-up from an earlier day has its own quest ID but still occupies today's clock.
 if(activeEnd&&activePlan&&!routeDayUnits(day,state).some(u=>'guide:'+u.id===activePlan.sourceId))blocked.push({kind:'active',start:current,end:activeEnd,title:activePlan.title});
 if(today&&state.restUntil>now)blocked.push({kind:'rest',start:current,end:(state.restUntil-midnight)/60000,title:'잠깐 쉬기'});
 blocked.sort((a,b)=>a.start-b.start);
 const latestByLecture=new Map();for(const [id,c] of Object.entries(state.checks).sort((a,b)=>b[1].at-a[1].at)){const base=routeUnit(id),lecture=c.lecture||base?.lecture;if(!lecture||latestByLecture.has(lecture))continue;latestByLecture.set(lecture,{...c,unit:routeUnits.find(u=>u.lecture===lecture)||base});}
 const weak=[...latestByLecture.values()].filter(c=>c.rating==='again').map(c=>c.unit).filter(Boolean);
 let weakIndex=0;
 const links=new Map(planner.plans.filter(p=>p.sourceId?.startsWith('guide:')).map(p=>[p.id,p.sourceId.slice(6)])),used=new Map();
 for(const r of planner.records){const id=links.get(r.planId);if(id)used.set(id,(used.get(id)||0)+r.duration/60000);}
 const f=planner.focus,focusId=links.get(f?.planId);if(focusId)used.set(focusId,(used.get(focusId)||0)+(f.elapsed+(f.started?Math.max(0,Math.min(now,f.stopAt||now)-f.started):0))/60000);
 let units=routeDayUnits(day,state).map(u=>{const changed=u.adaptive?weak[weakIndex++%Math.max(1,weak.length)]:null;return {...u,...(changed?{lecture:changed.lecture,student:changed.student,material:changed.material,question:changed.question,goal:changed.goal,title:changed.title+' 다시 확인'}:{}),remaining:isUnitComplete(u,state)?0:Math.max(5,u.minutes-(used.get(u.id)||0))};});
 // Keep the first dose of pharmacology and unlearned concepts when the day gets short.
 const assigned=state.questDays?.[date];let tasks=units;
 if(assigned){
  const byUnit=new Map(units.map(u=>[u.id,u])),byPlan=new Map(planner.plans.map(p=>[p.id,p])),legacy=new Map(),spent=new Map();
  for(const r of planner.records){const p=byPlan.get(r.planId);if(!p?.sourceId?.startsWith('guide:'))continue;const target=p.questId?spent:legacy,key=p.questId||p.sourceId.slice(6);target.set(key,(target.get(key)||0)+r.duration/60000);}
  if(f&&focusId){const p=byPlan.get(f.planId),target=p.questId?spent:legacy,key=p.questId||focusId;target.set(key,(target.get(key)||0)+(f.elapsed+(f.started?Math.max(0,Math.min(now,f.stopAt||now)-f.started):0))/60000);}
  tasks=assigned.items.map(q=>{const credited=Math.min(q.minutes,legacy.get(q.unitId)||0);legacy.set(q.unitId,Math.max(0,(legacy.get(q.unitId)||0)-credited));return {...byUnit.get(q.unitId),questId:q.id,remaining:assigned.done[q.id]?0:Math.max(5,q.minutes-credited-(spent.get(q.id)||0))};});
  units=units.map(u=>({...u,remaining:tasks.filter(q=>q.id===u.id).reduce((n,q)=>n+q.remaining,0)}));
 }
 const remainingTotal=tasks.reduce((n,u)=>n+u.remaining,0),order=state.order?.[date]||[],queue=tasks.filter(u=>u.remaining>=1).map(u=>u.id===focusId||order.includes(u.questId)?{...u,notBefore:0}:u).sort((a,b)=>{const rank=u=>u.id===focusId?-2:order.includes(u.questId)?order.indexOf(u.questId):-1;const aa=rank(a),bb=rank(b);return (aa===-1?100:aa)-(bb===-1?100:bb);});
 function allocate(order){let cursor=cursorStart,consecutive=0;const blocks=[];
  const pending=order.map(u=>({...u,left:Math.ceil(u.remaining)}));while(pending.some(u=>u.left>=1)&&cursor<endOfDay){
   const u=pending.find(u=>u.left>=1&&(u.notBefore||0)<=cursor);if(!u){const release=Math.min(endOfDay,...pending.filter(u=>u.left>=1).map(u=>u.notBefore||0));cursor=Math.max(cursor+1,release);continue;}let left=u.left;while(left>=1&&cursor<endOfDay){
   const overlap=blocked.find(b=>b.start<=cursor&&b.end>cursor);if(overlap){cursor=overlap.end;consecutive=0;continue;}
   const next=blocked.find(b=>b.start>cursor),end=Math.min(endOfDay,next?.start??endOfDay);
   if(end-cursor<10){cursor=end;continue;}
   if(consecutive>=60||(consecutive>0&&60-consecutive<15&&left>60-consecutive)){const n=Math.min(10,end-cursor);blocks.push({kind:'rest',start:cursor,end:cursor+n,title:'잠깐 쉬기'});cursor+=n;consecutive=0;continue;}
   const n=Math.min(left,60-consecutive,end-cursor);blocks.push({kind:'study',start:cursor,end:cursor+n,title:u.title,unit:u,questId:u.questId,minutes:n});left-=n;cursor+=n;consecutive+=n;
  }u.left=left;}return blocks;
 }
 let blocks=allocate(queue);const squeezed=blocks.filter(b=>b.kind==='study').reduce((n,b)=>n+b.minutes,0)+1<remainingTotal;
 // Preserve the chosen order when late; make overflow visible rather than silently skipping lectures.
 const allocated=blocks.filter(b=>b.kind==='study').reduce((n,b)=>n+b.minutes,0),rows=[...blocked.filter(b=>b.kind!=='class'),...classRows,...blocks].filter(b=>b.end>cursorStart&&b.start<endOfDay).sort((a,b)=>a.start-b.start);
 if(rows[0]?.start>cursorStart)rows.unshift({kind:'rest',start:cursorStart,end:rows[0].start,title:'잠깐 쉬기'});
 const pastUnfinished=today?studyDays.filter(d=>d.date<date).flatMap(d=>d.units).filter(u=>!u.adaptive&&!isUnitComplete(u,state)):[];
 return {day,rows,units,current:rows.find(b=>b.start<=Math.max(cursorStart,current)&&b.end>Math.max(cursorStart,current))||rows[0],allocated,remaining:remainingTotal,unplaced:Math.max(0,Math.ceil(remainingTotal-allocated)),squeezed,pastUnfinished,finished:units.every(u=>u.remaining<1),before:today&&current<420,after:today&&current>=endOfDay,extra,endOfDay};
}


