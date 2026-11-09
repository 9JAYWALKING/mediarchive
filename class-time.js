import {schedule} from './schedule-data.js';

export function currentClass(now=Date.now(),lessons=schedule){
 for(const lesson of lessons){
  const start=Date.parse(`${lesson.date}T${lesson.time}:00+09:00`),end=start+lesson.hours*3600000;
  if(now>=start&&now<end)return {...lesson,start,end,key:`${lesson.date}:${lesson.id}:${lesson.time}`};
 }
 return null;
}
export function classReleased(decision,lesson){return !!lesson&&decision?.key===lesson.key&&decision.early===true;}
export function createClassTime({storage=globalThis.localStorage}={}){
 const key='heart-companion-class-time-v1';let decision=null;
 try{decision=JSON.parse(storage.getItem(key)||'null');}catch{}
 return {
  current:currentClass,
  released(now=Date.now()){return classReleased(decision,currentClass(now));},
  answered(now=Date.now()){const c=currentClass(now);return !!c&&decision?.key===c.key;},
  answer(lesson,early){decision={key:lesson.key,early:early===true};try{storage.setItem(key,JSON.stringify(decision));}catch{}},
  lessons(now=Date.now()){const c=currentClass(now);return classReleased(decision,c)?schedule.filter(l=>l.id!==c.id||l.date!==c.date):schedule;}
 };
}
export const classTime=createClassTime();
