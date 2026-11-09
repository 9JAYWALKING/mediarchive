import {lessons,topics,questions} from './quiz-data.js';
const MINUTE=60000,DAY=86400000;
export const quizDay=now=>new Date(now+9*60*MINUTE).toISOString().slice(0,10);
const finite=n=>Number.isFinite(n)&&n>=0&&n<=8640000000000000;
export function freshQuiz(){return {version:1,progress:{},history:[],pending:null,remaining:20*MINUTE};}
export function normalizeQuiz(raw){
 const s=freshQuiz();if(!raw||typeof raw!=='object')return s;
 for(const t of topics){const p=raw.progress?.[t.id];if(p&&Number.isInteger(p.stage)&&p.stage>=1&&p.stage<=3&&finite(p.at))s.progress[t.id]={stage:p.stage,at:p.at};}
 const seen=new Set();
 if(Array.isArray(raw.history))s.history=raw.history.filter(h=>h&&typeof h.id==='string'&&h.id.length<100&&questions.some(q=>q.id===h.qid)&&finite(h.at)&&typeof h.correct==='boolean'&&[-3,0,2,3].includes(h.delta)&&Number.isInteger(h.selected)&&h.selected>=0&&h.selected<3&&!seen.has(h.id)&&seen.add(h.id)).map(h=>({id:h.id,qid:h.qid,at:h.at,correct:h.correct,delta:h.delta,selected:h.selected}));
 if(finite(raw.remaining))s.remaining=Math.min(28*MINUTE,raw.remaining);
 const p=raw.pending;
 if(p&&questions.some(q=>q.id===p.qid)&&typeof p.id==='string'&&p.id.length<100&&finite(p.at)&&!seen.has(p.id))s.pending={id:p.id,qid:p.qid,at:p.at};
 return s;
}
export function bondScore(memories,s){
 const minutes=memories.reduce((sum,m)=>sum+m.duration,0)/MINUTE;
 return Math.max(0,20+Math.floor(minutes*100/30)+s.history.reduce((sum,h)=>sum+h.delta,0));
}
export function eligibility(q,s,now){
 const topic=topics.find(t=>t.id===q.topic),lesson=lessons.find(l=>l.id===topic.lesson),p=s.progress[q.topic];
 if(!p||p.stage<q.minStage||p.at>now||now-p.at<10*MINUTE)return false;
 // A future timetable slot can be overridden only by explicitly recorded preview study.
 const preview=p.at<Date.parse(lesson.start);
 if(now<Date.parse(lesson.end)&&!preview)return false;
 const previous=s.history.filter(h=>h.qid===q.id).at(-1);
 if(previous&&now-previous.at<(previous.correct?DAY:30*MINUTE))return false;
 if(s.history.slice(-2).some(h=>h.qid===q.id))return false;
 return true;
}
export function chooseQuestion(s,now,random=Math.random){
 const pool=questions.filter(q=>eligibility(q,s,now));
 if(!pool.length)return null;
 // Unanswered topics first, then recovery and older topics. Timetable provides readiness;
 // explicit coverage, not elapsed timer time, provides proof the material was seen.
 const scored=pool.map(q=>{const h=s.history.filter(x=>x.qid===q.id).at(-1);const t=topics.find(t=>t.id===q.topic);const l=lessons.find(l=>l.id===t.lesson);return {q,score:(!h?5:!h.correct?4:1)+Math.min(2,Math.max(0,(now-Date.parse(l.end))/DAY)/7)+random()};});
 return scored.sort((a,b)=>b.score-a.score)[0].q;
}
export function setProgress(s,topic,stage,now){
 if(!topics.some(t=>t.id===topic)||!Number.isInteger(stage)||stage<0||stage>3)throw Error('Invalid progress');
 if(stage===0)delete s.progress[topic];else s.progress[topic]={stage,at:now};
 if(s.pending&&questions.find(q=>q.id===s.pending.qid)?.topic===topic)s.pending=null;
}
export function invite(s,now,random=Math.random){
 if(s.pending)return questions.find(q=>q.id===s.pending.qid);
 const q=chooseQuestion(s,now,random);if(!q)return null;
 s.pending={id:globalThis.crypto.randomUUID(),qid:q.id,at:now};return q;
}
export function postpone(s,random=Math.random){s.pending=null;s.remaining=(18+random()*10)*MINUTE;}
export function tick(s,dt,{active,visible,blocked,quiet}){
 if(!active||!visible||blocked||quiet||s.pending||dt<=0||dt>3000)return false;
 s.remaining=Math.max(0,s.remaining-dt);return s.remaining===0;
}
export function answer(s,attemptId,selected,now,score,random=Math.random){
 const p=s.pending;if(!p||p.id!==attemptId||s.history.some(h=>h.id===attemptId))return null;
 const q=questions.find(q=>q.id===p.qid);
 if(!Number.isInteger(selected)||selected<0||selected>=q.choices.length)return null;
 const correct=selected===q.answer,day=quizDay(now),daily=s.history.filter(h=>quizDay(h.at)===day),same=daily.filter(h=>h.qid===q.id);
 const prior=s.history.filter(h=>h.qid===q.id);
 let owed=0;for(const h of prior){if(h.delta<0)owed=-h.delta;else if(h.correct&&h.delta===3)owed=0;}
 let delta=0,recovered=false;
 if(correct){
  // A recovery refunds the last paid mistake once, even across midnight.
  if(owed){delta=owed;recovered=true;}
  else if(!same.some(h=>h.correct)&&daily.filter(h=>h.delta===2).length<5)delta=2;
 }else if(!same.some(h=>!h.correct)&&daily.reduce((n,h)=>n+Math.min(0,h.delta),0)>-9&&score>=3)delta=-3;
 const result={id:attemptId,qid:q.id,at:now,correct,delta,selected};s.history.push(result);postpone(s,random);
 return {...result,recovered};
}
export function mergeQuiz(current,incoming){
 const a=normalizeQuiz(current),b=normalizeQuiz(incoming);
 for(const [k,p] of Object.entries(b.progress))if(!a.progress[k]||p.at>a.progress[k].at)a.progress[k]=p;
 const h=new Map(a.history.map(x=>[x.id,x]));for(const x of b.history)if(!h.has(x.id))h.set(x.id,x);
 a.history=[...h.values()].sort((x,y)=>x.at-y.at);
 if(a.pending&&h.has(a.pending.id))a.pending=null;
 return normalizeQuiz(a);
}
