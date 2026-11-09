import {schedule} from './schedule-data.js';
import {koreanDate,shiftDate,validDate} from './game-state.js';
import {materialUnits} from './material-scope.js';
const HOUR=3600000;
export const dayStart=date=>Date.parse(date+'T00:00:00+09:00');
export function normalizeQuests(raw,now=Date.now()){
 const runs=new Map(),attendance={};
 for(const r of raw?.runs||[]){if(typeof r?.id!=='string'||r.id.length>220||!Number.isFinite(r.start)||!Number.isFinite(r.end)||r.end<r.start||r.end-r.start>7*24*HOUR)continue;const old=runs.get(r.id);runs.set(r.id,{id:r.id,start:Math.min(old?.start??r.start,r.start),end:Math.max(old?.end??r.end,r.end)});}
 for(const [date,at] of Object.entries(raw?.attendance||{}))if(validDate(date)&&Number.isFinite(at)&&koreanDate(at)===date&&at<dayStart(date)+7*HOUR)attendance[date]=at;
 const rest=raw?.rest&&typeof raw.rest.id==='string'&&Number.isFinite(raw.rest.started)&&[5,10,20,30].includes(raw.rest.minutes)?{id:raw.rest.id,started:raw.rest.started,minutes:raw.rest.minutes}:null;
 const rests=new Map();for(const r of raw?.rests||[])if(typeof r?.id==='string'&&Number.isFinite(r.start)&&Number.isFinite(r.end)&&r.end>=r.start)rests.set(r.id,{id:r.id,start:r.start,end:r.end});
 return {version:1,enabledAt:Number.isFinite(raw?.enabledAt)?raw.enabledAt:now,runs:[...runs.values()],attendance,rest,rests:[...rests.values()]};
}
export function mergeQuests(a,b,now=Date.now()){
 const right=normalizeQuests(b,now),attendance={...a.attendance};for(const [d,t] of Object.entries(right.attendance))attendance[d]=Math.min(attendance[d]??t,t);
 const result=normalizeQuests({enabledAt:Math.min(a.enabledAt,right.enabledAt),runs:[...a.runs,...right.runs],attendance,rests:[...a.rests,...right.rests]},now);
 return {...result,rest:a.rest}; // Backups never start a rest or timer.
}
export function unionDuration(intervals,start,end){
 const rows=intervals.map(r=>({start:Math.max(start,r.start),end:Math.min(end,r.end)})).filter(r=>r.end>r.start).sort((a,b)=>a.start-b.start);let total=0,last=start;
 for(const r of rows){total+=Math.max(0,r.end-Math.max(last,r.start));last=Math.max(last,r.end);}return total;
}
export function captureRun(state,session,student,now=Date.now()){
 if(!student||!session?.started||!session.id||state.rest)return state;
 const start=Math.max(state.enabledAt,session.started),end=Math.min(now,start+7*24*HOUR);if(end<=start)return state;
 const id=session.id+':'+session.started,old=state.runs.find(r=>r.id===id);if(old?.end>=end)return state;
 const run={id,start:old?.start??start,end};return {...state,runs:old?state.runs.map(r=>r.id===id?run:r):[...state.runs,run]};
}
export function checkAttendance(state,now=Date.now()){
 const date=koreanDate(now);if(now>=dayStart(date)+7*HOUR||state.attendance[date])return state;
 return {...state,attendance:{...state.attendance,[date]:now}};
}
export function afternoonAvailable(date,lessons=schedule){
 const start=dayStart(date)+14*HOUR,end=dayStart(date)+19*HOUR;
 const classes=lessons.filter(l=>l.date===date).map(l=>({start:Date.parse(l.date+'T'+l.time+':00+09:00'),end:Date.parse(l.date+'T'+l.time+':00+09:00')+l.hours*HOUR}));
 return end-start-unionDuration(classes,start,end)>=2*HOUR;
}
export function dailyQuests(state,date=koreanDate(),now=Date.now(),lessons=schedule){
 const start=dayStart(date),attendance=!!state.attendance[date],items=[{id:'attendance',title:'아침 출석',label:'07:00 전',value:attendance?1:0,target:1,from:start,to:start+7*HOUR,complete:attendance}];
 for(const [id,title,from,to,hours] of [['morning','오전 공부',0,14,3],['afternoon','오후 공부',14,19,2],['evening','저녁 공부',19,24,3]]){
  if(id==='afternoon'&&!afternoonAvailable(date,lessons))continue;
  const a=start+from*HOUR,b=start+to*HOUR,value=unionDuration(state.runs,a,Math.min(b,now));items.push({id,title,label:`${String(from).padStart(2,'0')}:00–${to===24?'24':String(to).padStart(2,'0')}:00`,value,target:hours*HOUR,from:a,to:b,complete:value>=hours*HOUR});
 }return items.map(q=>({...q,status:q.complete?'완료':now>=q.to?'마감':now<q.from?'대기':'진행 중'}));
}
export function weekStart(date){const day=new Date(date+'T12:00:00Z').getUTCDay();return shiftDate(date,-((day+6)%7));}
export function weeklyQuests(study,planner,date=koreanDate(),now=Date.now(),lessons=schedule){
 const start=weekStart(date),end=shiftDate(start,7),events=[...(study.growth?.events||[]).filter(r=>r.complete).map(r=>({lecture:r.context?.lecture,track:r.context?.track,at:r.at,duration:r.duration,preview:r.preview||0})),...(planner.records||[]).filter(r=>r.unitComplete).map(r=>({lecture:r.lecture,track:r.track,at:r.at,duration:r.duration,preview:r.preview||0}))];
 return {start,end:shiftDate(end,-1),lectures:lessons.filter(l=>l.date>=start&&l.date<end).sort((a,b)=>(a.date+' '+a.time).localeCompare(b.date+' '+b.time)||a.id-b.id).map(l=>{
  const after=Date.parse(l.date+'T'+l.time+':00+09:00')+l.hours*HOUR;
  return {...l,after,student:planner.settings.students.find(s=>s.lectures.includes(l.id)),units:['Wiki','J','JBL'].map(track=>{
   const available=materialUnits.includes(`${l.id}:${track}`),complete=available&&events.some(r=>r.lecture===l.id&&r.track===track&&r.duration-r.preview>=60000&&r.at>=after&&r.at<dayStart(end)&&r.at<=now);
   return {track,available,complete,status:complete?'완료':!available?'준비 중':now<after?'수업 전':now>=dayStart(end)?'마감':'복습'};
  })};
 })};
}
