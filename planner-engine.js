import {defaultStudents} from './planner-catalog.js';
import {schedule} from './schedule-data.js';
import {validDate,koreanDate,shiftDate} from './game-state.js';
import {routineContext} from './routine-engine.js';
import {recordSnapshot,focusPreview} from './student-growth.js';
import {materialUnits} from './material-scope.js';
import {normalizeMeals,mergeMeals,mealsForDate} from './meals-engine.js';
const clean=(s,n=80)=>typeof s==='string'?s.trim().slice(0,n):'';
const timeOK=s=>typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export const startOf=p=>Date.parse(`${p.date}T${p.time}:00+09:00`);
export const endOf=p=>startOf(p)+p.minutes*60000;
export function normalizePlanner(raw){
 const students=new Map(defaultStudents.map(s=>[s.id,{...s,lectures:[...s.lectures]}]));
 for(const s of Array.isArray(raw?.settings?.students)?raw.settings.students.slice(0,50):[]){if(!s||!clean(s.id)||!clean(s.name)||!clean(s.subject))continue;students.set(s.id,{id:clean(s.id),name:clean(s.name,20),subject:clean(s.subject,50),color:/^#[a-f\d]{6}$/i.test(s.color)?s.color:'#7e9cb2',enabled:s.enabled!==false,lectures:Array.isArray(s.lectures)?[...new Set(s.lectures.filter(id=>schedule.some(l=>l.id===id)))]:[]});}
 const ids=new Set(students.keys()),plans=new Map(),records=new Map();
 for(const p of Array.isArray(raw?.plans)?raw.plans:[]){
  if(!p||!clean(p.id,160)||!clean(p.title)||!validDate(p.date)||!timeOK(p.time)||!Number.isInteger(p.minutes)||p.minutes<5||p.minutes>720||!['scheduled','done','canceled'].includes(p.status)||!Number.isFinite(p.updatedAt))continue;
  const student=ids.has(p.student)?p.student:'',lecture=schedule.some(l=>l.id===p.lecture)?p.lecture:null;
  const v={id:clean(p.id,160),title:clean(p.title),student,lecture,track:['Wiki','J','JBL'].includes(p.track)?p.track:'',date:p.date,time:p.time,minutes:p.minutes,note:clean(p.note,500),status:p.status,createdAt:Number(p.createdAt)||p.updatedAt,updatedAt:p.updatedAt,series:clean(p.series,160),sourceId:clean(p.sourceId,160)};
  if(!plans.has(v.id)||plans.get(v.id).updatedAt<=v.updatedAt)plans.set(v.id,v);
 }
 for(const r of Array.isArray(raw?.records)?raw.records:[]){if(!r||!clean(r.id,160)||(!plans.has(r.planId)&&!r.snapshot)||!Number.isFinite(r.at)||!Number.isFinite(r.duration)||r.duration<1000||r.duration>604800000||records.has(r.id))continue;const snap=recordSnapshot(r.snapshot?r:plans.get(r.planId));records.set(r.id,{id:r.id,planId:r.planId,at:r.at,duration:r.duration,...snap,preview:Math.max(0,Math.min(r.duration,Number(r.preview)||0)),unitComplete:r.unitComplete===true&&r.duration>=60000,cycle:Number.isInteger(r.cycle)&&r.cycle>=1&&r.cycle<=5?r.cycle:1,scope:Array.isArray(r.scope)?[...new Set(r.scope.filter(u=>materialUnits.includes(u)))]:[]});}
 const f=raw?.focus,focus=f&&plans.has(f.planId)&&Number.isFinite(f.elapsed)&&f.elapsed>=0&&f.elapsed<=604800000?{id:clean(f.id,160)||crypto.randomUUID(),planId:f.planId,elapsed:f.elapsed,started:null,...recordSnapshot(f.snapshot?f:plans.get(f.planId)),previewElapsed:Math.max(0,Math.min(f.elapsed,Number(f.previewElapsed)||0)),cycle:Number.isInteger(f.cycle)&&f.cycle>=1&&f.cycle<=5?f.cycle:1,scope:Array.isArray(f.scope)?f.scope.filter(u=>materialUnits.includes(u)):[]}:null;
 return {version:1,meals:normalizeMeals(raw?.meals),settings:{updatedAt:Number(raw?.settings?.updatedAt)||0,students:[...students.values()]},plans:[...plans.values()].sort((a,b)=>startOf(a)-startOf(b)),records:[...records.values()],focus};
}
export function mergePlanner(a,b){const settings=(b?.settings?.updatedAt||0)>(a?.settings?.updatedAt||0)?b.settings:a.settings;const merged=normalizePlanner({settings,plans:[...(a?.plans||[]),...(b?.plans||[])],records:[...(a?.records||[]),...(b?.records||[])]});return {...merged,meals:mergeMeals(a?.meals,b?.meals),focus:a?.focus||null};}
export function plannerSnapshot(state,now=Date.now()){return {...state,focus:state.focus?{...state.focus,elapsed:focusElapsed(state.focus,now),previewElapsed:focusPreview(state.focus,state.plans.find(p=>p.id===state.focus.planId)||{},now),started:null}:null};}
export function focusElapsed(f,now=Date.now()){return f?f.elapsed+(f.started?Math.max(0,now-f.started):0):0;}
export function planIssues(p,state){
 const issues=[];if(!clean(p.title))issues.push('이름을 입력해 줘.');
 if(!validDate(p.date)||!timeOK(p.time)||!Number.isInteger(p.minutes)||p.minutes<5||p.minutes>720)return {errors:[...issues,'시간은 5–720분으로 설정해 줘.'],warnings:[]};
 if(koreanDate(endOf(p)-1)!==p.date)issues.push('자정을 넘는 일정은 날짜별로 나눠 줘.');
 const s=state.settings.students.find(s=>s.id===p.student);
 if(p.student&&!s)issues.push('학생을 다시 골라 줘.');
 if(p.lecture&&(!s||!s.lectures.includes(p.lecture)))issues.push('선택한 학생의 담당 강의를 골라 줘.');
 if(p.track&&!p.lecture)issues.push('자료를 연결할 강의를 골라 줘.');
 const conflicts=state.plans.filter(x=>x.id!==p.id&&x.status==='scheduled'&&startOf(p)<endOf(x)&&endOf(p)>startOf(x));
 const classes=schedule.filter(l=>{const b={date:l.date,time:l.time,minutes:l.hours*60};return startOf(p)<endOf(b)&&endOf(p)>startOf(b);});
 const mealOverlap=[...mealsForDate(state.meals,shiftDate(p.date,-1)),...mealsForDate(state.meals,p.date)].some(m=>startOf(p)<m.until&&endOf(p)>m.at);
 const warnings=[];if(mealOverlap)warnings.push('식사시간과 겹쳐.');if(conflicts.length)warnings.push(`다른 약속 ${conflicts.length}개와 겹쳐.`);if(classes.length)warnings.push(`수업 ${classes.length}개와 겹쳐.`);
 if(!['morning','review','evening'].includes(routineContext(startOf(p),schedule,state.meals).phase)||!['morning','review','evening'].includes(routineContext(endOf(p)-1,schedule,state.meals).phase))warnings.push('식사·휴식·취침 시간도 확인해 줘.');
 return {errors:issues,warnings};
}
export function repeatDates(date,kind,until){
 if(kind==='none')return [date];if(!validDate(date)||!validDate(until)||until<date||Date.parse(until)-Date.parse(date)>90*86400000)throw Error('반복은 시작일부터 90일 안으로 설정해 줘.');
 const dates=[];for(let d=date;d<=until;d=shiftDate(d,1)){const weekday=new Date(d+'T12:00:00Z').getUTCDay();if(kind==='daily'||kind==='weekdays'&&weekday>=1&&weekday<=5||kind==='weekly'&&(Date.parse(d)-Date.parse(date))%604800000===0)dates.push(d);}
 if(!dates.length||dates.length>60)throw Error('한 번에 최대 60개의 약속을 만들 수 있어.');return dates;
}
export function buildPlans(state,draft,{repeat='none',until=draft.date,allowOverlap=false,now=Date.now(),uuid=()=>crypto.randomUUID()}={}){
 let dates;try{dates=repeatDates(draft.date,repeat,until);}catch(e){return {error:e.message};}
 const old=state.plans.find(x=>x.id===draft.id);if(old&&repeat!=='none')return {error:'이미 잡은 약속은 이번 일정만 변경할 수 있어.'};const series=dates.length>1?uuid():old?.series||'';const additions=[];
 for(const date of dates){const p={...draft,date,id:old?.id||uuid(),status:old?.status==='done'?'done':'scheduled',createdAt:old?.createdAt||now,updatedAt:now,series};const issues=planIssues(p,{...state,plans:[...state.plans,...additions]});if(issues.errors.length)return {error:issues.errors[0]};if(issues.warnings.length&&!allowOverlap)return {error:`${date.slice(5)} · ${issues.warnings.join(' ')}`,conflict:true};additions.push(p);}
 return {state:{...state,plans:normalizePlanner({...state,plans:[...state.plans.filter(x=>!additions.some(p=>p.id===x.id)),...additions]}).plans},count:additions.length};
}
export function legacyMomoPlans(raw){return (raw?.plans||[]).map(p=>({...p,title:`${schedule.find(l=>l.id===p.lecture)?.title||'함께 보기'} 복습`,track:'Wiki',note:'',series:'',sourceId:p.messageId}));}
export function nextPlan(state,now=Date.now()){return state.plans.filter(p=>p.status==='scheduled'&&endOf(p)>now).sort((a,b)=>startOf(a)-startOf(b))[0]||null;}
