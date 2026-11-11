import {schedule} from './schedule-data.js';
import {koreanDate,shiftDate} from './game-state.js';
import {mealsForDate} from './meals-engine.js';
export function agendaItem(planner,now=Date.now(),lessons=schedule,session=null){
 const date=koreanDate(now),start=p=>Date.parse(p.date+'T'+p.time+':00+09:00');
 const focus=planner.focus||session;
 if(focus){const p=planner.plans.find(p=>p.id===focus.planId);if(p)return {...p,kind:'focus',label:focus.started?'진행 중':'일시정지'};}
 const rows=[...planner.plans.filter(p=>p.status==='scheduled').map(p=>({...p,kind:'plan'})),...lessons.filter(l=>l.date===date).map(l=>({...l,kind:'class',minutes:l.hours*60})),...[...mealsForDate(planner.meals,shiftDate(date,-1)),...mealsForDate(planner.meals,date)].map(m=>({...m,kind:'meal'}))].filter(p=>start(p)+p.minutes*60000>now);
 const active=rows.filter(p=>start(p)<=now).sort((a,b)=>({meal:0,plan:1,class:2}[a.kind]-{meal:0,plan:1,class:2}[b.kind]));
 const p=active[0]||rows.sort((a,b)=>start(a)-start(b))[0];if(!p)return null;
 return {...p,label:start(p)<=now?'지금':p.date===date?p.time:p.date.slice(5)+' '+p.time};
}
// Appointment deadlines follow the booked clock time, independently of study time.
export function agendaTiming(item,now=Date.now()){
 if(!item||!['focus','plan'].includes(item.kind))return null;
 const start=Date.parse(item.date+'T'+item.time+':00+09:00'),end=start+item.minutes*60000;
 if(!Number.isFinite(start)||!Number.isFinite(end))return null;
 const endDate=new Date(end+9*3600000),endTime=endDate.toISOString().slice(11,16);
 const range=item.time+'–'+(endTime==='00:00'&&end>start?'24:00':endTime);
 if(item.kind!=='focus'&&now<start)return {range,remaining:''};
 const minutes=Math.ceil((end-now)/60000),hours=Math.floor(minutes/60),rest=minutes%60;
 const remaining=minutes<=0?'예정 시간 종료':end-now<60000?'완료까지 1분 미만':'완료까지 '+(hours?hours+'시간'+(rest?' ':''):'')+(rest?rest+'분':'');
 return {range,remaining};
}
