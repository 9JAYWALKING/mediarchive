import {koreanDate,shiftDate,validDate} from './game-state.js';
export const mealNames={breakfast:'아침',lunch:'점심',dinner:'저녁'};
export const suggestedMeals=[{id:'breakfast',start:'06:00',end:'06:30',enabled:true},{id:'lunch',start:'13:00',end:'14:00',enabled:true},{id:'dinner',start:'18:00',end:'19:00',enabled:true}];
const validTime=s=>typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export const mealMinutes=e=>{if(!validTime(e.start)||!validTime(e.end))return 0;const minutes=s=>Number(s.slice(0,2))*60+Number(s.slice(3));return (minutes(e.end)-minutes(e.start)+1440)%1440;};
function entries(raw){return suggestedMeals.map(base=>{const e=Array.isArray(raw)?raw.find(x=>x?.id===base.id):null;return e&&mealMinutes(e)>=5&&mealMinutes(e)<=180?{id:base.id,start:e.start,end:e.end,enabled:e.enabled!==false}:{...base,enabled:false};});}
export function normalizeMeals(raw){
 const d=raw?.defaults,days=new Map();for(const day of Array.isArray(raw?.days)?raw.days:[]){if(!validDate(day?.date)||!Number.isFinite(day.updatedAt))continue;const value={date:day.date,updatedAt:day.updatedAt,inherit:day.inherit===true,entries:entries(day.entries)};if(!days.has(day.date)||days.get(day.date).updatedAt<=day.updatedAt)days.set(day.date,value);}
 return {version:1,defaults:{configured:d?.configured===true,updatedAt:Number(d?.updatedAt)||0,entries:d?entries(d.entries):suggestedMeals.map(e=>({...e}))},days:[...days.values()]};
}
export function mergeMeals(a,b){const left=normalizeMeals(a),right=normalizeMeals(b);return normalizeMeals({defaults:right.defaults.updatedAt>left.defaults.updatedAt?right.defaults:left.defaults,days:[...right.days,...left.days]});}
export function mealDay(state,date){const s=state||normalizeMeals(null),day=s.days.find(d=>d.date===date&&!d.inherit);return {configured:!!day||s.defaults.configured,custom:!!day,entries:day?.entries||s.defaults.entries};}
export function mealsForDate(state,date){const day=mealDay(state,date);return day.configured?day.entries.filter(e=>e.enabled).map(e=>{const at=Date.parse(date+'T'+e.start+':00+09:00');return {...e,title:mealNames[e.id]+' 식사',date,time:e.start,minutes:mealMinutes(e),at,until:at+mealMinutes(e)*60000,key:`${date}:${e.id}:${e.start}:${e.end}`};}):[];}
export function mealContext(state,now=Date.now()){
 if(!state)return null;const date=koreanDate(now),all=[...mealsForDate(state,shiftDate(date,-1)),...mealsForDate(state,date),...mealsForDate(state,shiftDate(date,1))];
 const current=all.find(e=>now>=e.at&&now<e.until);if(current)return {meal:current,stage:now>=current.until-5*60000?'ending':'during'};
 const next=all.filter(e=>now>=e.at-10*60000&&now<e.at).sort((a,b)=>a.at-b.at)[0];if(next)return {meal:next,stage:'before'};
 const previous=all.filter(e=>now>=e.until&&now<e.until+90*60000).sort((a,b)=>b.until-a.until)[0];return previous?{meal:previous,stage:now<previous.until+45*60000?'after1':'after2'}:null;
}
export function mealErrors(list){
 if(list.some(e=>e.enabled&&(!mealNames[e.id]||mealMinutes(e)<5||mealMinutes(e)>180)))return '식사 시간은 5분–3시간으로 정해 줘.';
 const ranges=list.filter(e=>e.enabled).map(e=>({start:Number(e.start.slice(0,2))*60+Number(e.start.slice(3)),duration:mealMinutes(e)}));
 for(let i=0;i<ranges.length;i++)for(let j=i+1;j<ranges.length;j++)for(const shift of [-1440,0,1440])if(ranges[i].start<ranges[j].start+shift+ranges[j].duration&&ranges[i].start+ranges[i].duration>ranges[j].start+shift)return '식사 시간끼리는 겹치지 않게 정해 줘.';
 return '';
}
export function mealConflicts(meals,plans,lessons){return meals.some(m=>[...plans.filter(p=>p.status==='scheduled'),...lessons.map(l=>({...l,minutes:l.hours*60}))].some(p=>{const start=Date.parse(p.date+'T'+p.time+':00+09:00');return m.at<start+p.minutes*60000&&m.until>start;}));}
