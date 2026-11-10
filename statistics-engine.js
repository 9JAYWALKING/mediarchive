import {allocatedTargets} from './linked-study.js?v=20261110';
import {arrivalPenalty} from './quest-engine.js?v=20261110';
import {reviewBond,reviewHistory} from './review-engine.js?v=20261110';
import {reconcileGrowth,sessionTotals} from './growth-engine.js?v=20261110';
import {studentGrowth} from './student-growth.js?v=20261110';
import {koreanDate,shiftDate} from './game-state.js';
export function unifiedRecords(study,planner){
 const records=[],ids=new Set(),signatures=new Set();
 for(const r of reconcileGrowth(study.growth,study.memories||[]).events){const id=r.id,sig=`${r.at}|${r.duration}`;ids.add(id);signatures.add(sig);records.push({id,at:r.at,duration:r.duration,student:'haru',lecture:r.context?.lecture||null,track:r.context?.track||'',title:'하루',preview:r.preview||0,complete:r.complete,mode:r.mode});}
 for(const r of planner.records||[]){const p=planner.plans.find(p=>p.id===r.planId),snapshot=r.snapshot?r:p;if(ids.has(r.id)||snapshot?.student==='haru'&&signatures.has(`${r.at}|${r.duration}`))continue;ids.add(r.id);records.push({...r,student:snapshot?.student||'',lecture:snapshot?.lecture||null,track:snapshot?.track||'',title:snapshot?.title||'개인 일정',complete:r.unitComplete===true});}
 return records.sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id));
}
export function durationText(ms){const seconds=Math.floor(Math.max(0,ms)/1000);return seconds>=3600?`${Math.floor(seconds/3600)}시간 ${Math.floor(seconds/60)%60}분`:seconds>=60?`${Math.floor(seconds/60)}분 ${seconds%60}초`:`${seconds}초`;}
// One lifetime roster feeds both the teacher rank and student cards.
export function growthRoster(planner,haruGrowth){
 const catalog=[...planner.settings.students];
 for(const r of planner.records||[])if(r.student&&!catalog.some(s=>s.id===r.student))catalog.push({id:r.student,name:'이전 학생',subject:'이전 연결',lectures:[],color:'#92a4b1',archived:true});
 return catalog.map(student=>({student,growth:student.id==='haru'?{...haruGrowth,scope:[1,2,6].flatMap(id=>['Wiki','J','JBL'].map(t=>`${id}:${t}`))}:studentGrowth(planner.records,student)}));
}
export function analyzeStatistics({study,planner,growth,bond,quiz,reviews={runs:[]},quests={}},options={},now=Date.now()){
 const today=koreanDate(now),all=unifiedRecords(study,planner),from=options.from||'2000-01-01',to=options.to||today;
 const selected=all.filter(r=>{const d=koreanDate(r.at);return d>=from&&d<=to;});
 const students=growthRoster(planner,growth).map(({student:s,growth:g})=>{const entries=selected.filter(r=>r.student===s.id),lifetime=all.filter(r=>r.student===s.id);if(s.id==='haru')g.bond=bond;
  g.bond=Math.max(0,g.bond+reviewBond(reviews,s.id)+arrivalPenalty(quests,s.id,now));const reviewEntries=[...reviewHistory(reviews).filter(a=>a.student===s.id),...(s.id==='haru'?quiz.history||[]:[])].filter(a=>koreanDate(a.at)>=from&&koreanDate(a.at)<=to);
  const plans=planner.plans.filter(p=>p.student===s.id&&p.date>=from&&p.date<=to&&p.status!=='canceled');
  return {...s,entries,lifetime,growth:g,review:{total:reviewEntries.length,correct:reviewEntries.filter(a=>a.correct).length,delta:reviewEntries.reduce((n,a)=>n+a.delta,0)},time:entries.reduce((n,r)=>n+r.duration,0),lifetimeTime:lifetime.reduce((n,r)=>n+r.duration,0),count:entries.length,lastAt:lifetime.at(-1)?.at||0,tracks:Object.fromEntries(['Wiki','J','JBL',''].map(t=>[t,entries.reduce((n,r)=>n+(r.targets?.length?allocatedTargets(r).filter(x=>x.track===t).reduce((a,x)=>a+x.duration,0):r.track===t?r.duration:0),0)])),preview:entries.reduce((n,r)=>n+(r.preview||0),0),plans:{total:plans.length,done:plans.filter(p=>p.status==='done').length}};
 });
 const studying=selected.filter(r=>r.student);const days=new Map();for(const r of studying){const d=koreanDate(r.at);days.set(d,(days.get(d)||0)+r.duration);}
 const weekly=Array.from({length:7},(_,i)=>{const date=shiftDate(to,i-6);return {date,duration:date>=from?(days.get(date)||0):0};});
 let streak=0,cursor=days.has(today)?today:shiftDate(today,-1);while(days.has(cursor)){streak++;cursor=shiftDate(cursor,-1);}
 const total=studying.reduce((n,r)=>n+r.duration,0),q=(quiz.history||[]).filter(h=>koreanDate(h.at)>=from&&koreanDate(h.at)<=to);
 q.push(...reviewHistory(reviews).filter(h=>koreanDate(h.at)>=from&&koreanDate(h.at)<=to));
 const pending=study.session?{student:'haru',duration:sessionTotals(study.session,now).duration,running:!!study.session.started}:planner.focus?{student:planner.focus.student||planner.plans.find(p=>p.id===planner.focus.planId)?.student,duration:planner.focus.elapsed+(planner.focus.started?Math.max(0,now-planner.focus.started):0),running:!!planner.focus.started}:null;
 return {all,selected,students,total,count:selected.length,studyCount:studying.length,days:days.size,average:days.size?total/days.size:0,longest:Math.max(0,...studying.map(r=>r.duration)),streak,weekly,pending,personal:selected.filter(r=>!r.student).reduce((n,r)=>n+r.duration,0),quiz:{total:q.length,correct:q.filter(h=>h.correct).length,delta:q.reduce((n,h)=>n+h.delta,0)},from,to};
}
