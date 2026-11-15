import {studyDays,routeUnit} from './study-route-data.js?v=20261116guideDM2';
import {schedule} from './schedule-data.js?v=20261116guideDM2';
import {koreanDate} from './game-state.js';
export const routeKey='mediarchive-study-route-v1';
export const minute=s=>Number(s.slice(0,2))*60+Number(s.slice(3));
export const clock=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(Math.floor(m%60)).padStart(2,'0')}`;
export const dayMinute=now=>(now-Date.parse(koreanDate(now)+'T00:00:00+09:00'))/60000;
export function normalizeRoute(raw){
 const out={version:1,checks:{},mealDeferrals:{},meals:[],activeMeal:null,restUntil:0,reviewed:[],signals:[],enabled:raw?.enabled!==false};
 for(const [id,c] of Object.entries(raw?.checks||{}).slice(0,1000))if(routeUnit(id)&&c&&['again','clear','partial'].includes(c.rating)&&Number.isFinite(c.at))out.checks[id]={rating:c.rating,at:c.at,done:c.done===true};
 out.meals=(Array.isArray(raw?.meals)?raw.meals:[]).filter(m=>m&&Number.isFinite(m.start)&&Number.isFinite(m.end)&&m.end>=m.start&&m.end-m.start<=86400000&&['lunch','dinner','other'].includes(m.kind)).slice(-100);
 for(const [key,until] of Object.entries(raw?.mealDeferrals||{}).slice(-40))if(/^2026-11-\d{2}:(lunch|dinner)$/.test(key)&&Number.isFinite(until)&&until>=0)out.mealDeferrals[key]=until;
 const a=raw?.activeMeal;if(a&&Number.isFinite(a.start)&&['lunch','dinner','other'].includes(a.kind))out.activeMeal={start:a.start,kind:a.kind};
 if(Number.isFinite(raw?.restUntil))out.restUntil=raw.restUntil;
 out.reviewed=(Array.isArray(raw?.reviewed)?raw.reviewed:[]).filter(s=>typeof s==='string'&&s.length<160).slice(-2000);
 out.signals=(Array.isArray(raw?.signals)?raw.signals:[]).filter(s=>typeof s==='string'&&s.length<200).slice(-300);
 return out;
}
export function mergeRoute(a,b){const left=normalizeRoute(a),right=normalizeRoute(b);for(const [id,c] of Object.entries(right.checks))if(!left.checks[id]||left.checks[id].at<c.at)left.checks[id]=c;for(const [key,until] of Object.entries(right.mealDeferrals))left.mealDeferrals[key]=Math.max(left.mealDeferrals[key]||0,until);left.reviewed=[...new Set([...left.reviewed,...right.reviewed])];left.meals=[...new Map([...left.meals,...right.meals].map(m=>[m.start,m])).values()];return normalizeRoute(left);}
export function unitMinutes(unit,planner,now=Date.now()){
 const ids=new Set(planner.plans.filter(p=>p.sourceId==='guide:'+unit.id).map(p=>p.id));
 const saved=planner.records.filter(r=>ids.has(r.planId)).reduce((sum,r)=>sum+r.duration,0),f=planner.focus;
 return (saved+(f&&ids.has(f.planId)?f.elapsed+(f.started?Math.max(0,Math.min(now,f.stopAt||now)-f.started):0):0))/60000;
}
export function routeFocus(planner){const p=planner.plans.find(p=>p.id===planner.focus?.planId);const u=p?.sourceId?.startsWith('guide:')?routeUnit(p.sourceId.slice(6)):null;return u?{...u,lecture:p.lecture,student:p.student,title:p.title,goal:p.note,material:p.track}:null;}
function mergeBusy(rows){const result=[];for(const row of [...rows].sort((a,b)=>a.start-b.start)){const prev=result.at(-1);if(prev&&row.start<=prev.end&&row.kind===prev.kind){prev.end=Math.max(prev.end,row.end);prev.title+=' · '+row.title;prev.lectures.push(...(row.lectures||[]));}else result.push({...row,lectures:row.lectures||[]});}return result;}
export function buildRoute(date,state,planner,{now=Date.now(),fromNow=true,lessons=schedule,releasedAt}={}){
 const day=studyDays.find(d=>d.date===date);if(!day)return null;
 const midnight=Date.parse(date+'T00:00:00+09:00'),today=koreanDate(now)===date,current=(now-midnight)/60000;
 const cursorStart=today&&fromNow?Math.max(420,Math.ceil(current)):420;
 const classRows=lessons.filter(l=>l.date===date).map(l=>({kind:'class',start:minute(l.time),end:minute(l.time)+l.hours*60,title:l.title,lectures:[l.id]})),classes=mergeBusy(classRows);
 const personal=planner.plans.filter(p=>p.date===date&&p.status==='scheduled'&&!p.sourceId?.startsWith('guide:')).map(p=>({kind:'plan',start:minute(p.time),end:minute(p.time)+p.minutes,title:p.title,planId:p.id}));
 const actual=state.meals.filter(m=>koreanDate(m.start)===date).map(m=>({kind:'meal',meal:m.kind,start:(m.start-midnight)/60000,end:(m.end-midnight)/60000,title:m.kind==='dinner'?'저녁':'식사',actual:true}));
 const fixed=[...classes,...personal];
 const mealAt=(proposed,length)=>{let start=proposed;for(let i=0;i<20;i++){const clash=fixed.find(b=>start<b.end&&start+length>b.start);if(!clash)return start;start=clash.end;}return start;};
 const morning=classes.filter(c=>c.start<840&&c.end>660),lunch=mealAt(Number.isFinite(releasedAt)?releasedAt:morning.length?Math.max(...morning.map(c=>c.end)):720,45),dinner=mealAt(1080,45);
 const meals=[...actual];
 for(const [kind,start] of [['lunch',lunch],['dinner',dinner]])if(!actual.some(m=>m.meal===kind)&&state.activeMeal?.kind!==kind){let at=Math.max(start,((state.mealDeferrals?.[date+':'+kind]||midnight)-midnight)/60000);if(today&&fromNow&&at<cursorStart)at=mealAt(cursorStart,45);meals.push({kind:'meal',meal:kind,start:at,end:at+45,title:kind==='lunch'?'점심':'저녁',tentative:true});}
 if(state.activeMeal&&koreanDate(state.activeMeal.start)===date)meals.push({kind:'meal',meal:state.activeMeal.kind,start:(state.activeMeal.start-midnight)/60000,end:Math.max(current+30,(state.activeMeal.start-midnight)/60000+50),title:'식사 중',actual:true,active:true});
 // A late lunch must not share the same proposed window with dinner.
 meals.sort((a,b)=>a.start-b.start);for(let i=1;i<meals.length;i++)if(meals[i].tentative&&meals[i].start<meals[i-1].end+90){meals[i].start=mealAt(meals[i-1].end+90,45);meals[i].end=meals[i].start+45;}
 const blocked=[...fixed,...meals].sort((a,b)=>a.start-b.start);
 if(today&&state.restUntil>now)blocked.push({kind:'rest',start:current,end:(state.restUntil-midnight)/60000,title:'잠깐 쉬기'});
 blocked.sort((a,b)=>a.start-b.start);
 const weak=Object.entries(state.checks).filter(([,c])=>c.rating==='again').sort((a,b)=>b[1].at-a[1].at).map(([id])=>routeUnit(id)).filter(Boolean);
 let weakIndex=0;
 const links=new Map(planner.plans.filter(p=>p.sourceId?.startsWith('guide:')).map(p=>[p.id,p.sourceId.slice(6)])),used=new Map();
 for(const r of planner.records){const id=links.get(r.planId);if(id)used.set(id,(used.get(id)||0)+r.duration/60000);}
 const f=planner.focus,focusId=links.get(f?.planId);if(focusId)used.set(focusId,(used.get(focusId)||0)+(f.elapsed+(f.started?Math.max(0,Math.min(now,f.stopAt||now)-f.started):0))/60000);
 const units=day.units.map(u=>{const changed=u.id.endsWith('recall')?weak[0]:u.title.startsWith('약한 묶음')?weak[weakIndex++]:null;return {...u,...(changed?{lecture:changed.lecture,student:changed.student,material:changed.material,question:changed.question,goal:changed.goal,title:changed.title+' 다시 확인'}:{}),remaining:state.checks[u.id]?.done?0:Math.max(0,u.minutes-(used.get(u.id)||0))};});
 // Keep the first dose of pharmacology and unlearned concepts when the day gets short.
 const remainingTotal=units.reduce((n,u)=>n+u.remaining,0),queue=units.filter(u=>u.remaining>=1);
 function allocate(order){let cursor=cursorStart,consecutive=0;const blocks=[];
  for(const u of order){let left=Math.ceil(u.remaining);while(left>=1&&cursor<1380){
   const overlap=blocked.find(b=>b.start<=cursor&&b.end>cursor);if(overlap){cursor=overlap.end;consecutive=0;continue;}
   const next=blocked.find(b=>b.start>cursor),end=Math.min(1380,next?.start??1380);
   if(end-cursor<10){cursor=end;continue;}
   if(consecutive>=60||(consecutive>0&&60-consecutive<15&&left>60-consecutive)){const n=Math.min(10,end-cursor);blocks.push({kind:'rest',start:cursor,end:cursor+n,title:'잠깐 쉬기'});cursor+=n;consecutive=0;continue;}
   const n=Math.min(left,60-consecutive,end-cursor);blocks.push({kind:'study',start:cursor,end:cursor+n,title:u.title,unit:u,minutes:n});left-=n;cursor+=n;consecutive+=n;
  }}return blocks;
 }
 let blocks=allocate(queue);const squeezed=blocks.filter(b=>b.kind==='study').reduce((n,b)=>n+b.minutes,0)+1<remainingTotal;
 if(squeezed){const rank=u=>u.id.endsWith('recall')?-1:u.lecture>=8&&u.lecture<=13?0:state.checks[u.id]?.rating==='clear'?3:u.material==='Wiki'?1:2;blocks=allocate([...queue].sort((a,b)=>rank(a)-rank(b)));}
 const allocated=blocks.filter(b=>b.kind==='study').reduce((n,b)=>n+b.minutes,0),rows=[...blocked.filter(b=>b.kind!=='class'),...classRows,...blocks].filter(b=>b.end>cursorStart&&b.start<1380).sort((a,b)=>a.start-b.start);
 if(rows[0]?.start>cursorStart)rows.unshift({kind:'rest',start:cursorStart,end:rows[0].start,title:'잠깐 쉬기'});
 const pastUnfinished=today?studyDays.filter(d=>d.date<date).flatMap(d=>d.units).filter(u=>!state.checks[u.id]?.done&&(used.get(u.id)||0)<u.minutes):[];
 return {day,rows,units,current:rows.find(b=>b.start<=Math.max(cursorStart,current)&&b.end>Math.max(cursorStart,current))||rows[0],allocated,remaining:remainingTotal,unplaced:Math.max(0,Math.ceil(remainingTotal-allocated)),squeezed,pastUnfinished,finished:units.every(u=>u.remaining<1),before:today&&current<420,after:today&&current>=1380};
}
