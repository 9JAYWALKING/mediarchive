import {schedule} from './schedule-data.js';
import {koreanDate,shiftDate} from './game-state.js';
import {mealsForDate} from './meals-engine.js';
export function agendaItem(planner,now=Date.now(),lessons=schedule){
 const date=koreanDate(now),start=p=>Date.parse(p.date+'T'+p.time+':00+09:00');
 if(planner.focus){const p=planner.plans.find(p=>p.id===planner.focus.planId);if(p)return {...p,kind:'focus',label:planner.focus.started?'진행 중':'일시정지'};}
 const rows=[...planner.plans.filter(p=>p.status==='scheduled').map(p=>({...p,kind:'plan'})),...lessons.filter(l=>l.date===date).map(l=>({...l,kind:'class',minutes:l.hours*60})),...[...mealsForDate(planner.meals,shiftDate(date,-1)),...mealsForDate(planner.meals,date)].map(m=>({...m,kind:'meal'}))].filter(p=>start(p)+p.minutes*60000>now);
 const active=rows.filter(p=>start(p)<=now).sort((a,b)=>({meal:0,plan:1,class:2}[a.kind]-{meal:0,plan:1,class:2}[b.kind]));
 const p=active[0]||rows.sort((a,b)=>start(a)-start(b))[0];if(!p)return null;
 return {...p,label:start(p)<=now?'지금':p.date===date?p.time:p.date.slice(5)+' '+p.time};
}
