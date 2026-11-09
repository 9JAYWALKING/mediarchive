import {reviewQuestions} from './review-data.js';
const byId=new Map(reviewQuestions.map(q=>[q.id,q]));
const finite=n=>Number.isFinite(n)&&n>=0&&n<8640000000000000;
const text=x=>typeof x==='string'&&x.length>0&&x.length<=100;
const day=n=>new Date(n+32400000).toISOString().slice(0,10);
export function normalizeReview(raw){
 const state={version:1,runs:[]},seen=new Set();
 for(const r of Array.isArray(raw?.runs)?raw.runs:[]){
  if(!r||!text(r.id)||seen.has(r.id)||!text(r.student)||!finite(r.at)||!Array.isArray(r.qids)||r.qids.length<2||r.qids.length>3||new Set(r.qids).size!==r.qids.length||!r.qids.every(id=>byId.get(id)?.lecture===r.lecture))continue;
  const order=r.qids.map((id,i)=>Array.isArray(r.order?.[i])&&r.order[i].length===3&&new Set(r.order[i]).size===3&&r.order[i].every(n=>[0,1,2].includes(n))?r.order[i]:[0,1,2]);
  const answers=[];
  for(const a of Array.isArray(r.answers)?r.answers:[]){const q=byId.get(a?.qid);if(!q||!r.qids.includes(a.qid)||!finite(a.at)||![-1,0,1,2].includes(a.selected)||![-2,-1,0,1,2].includes(a.delta))continue;const prior=answers.filter(x=>x.qid===a.qid);if(prior.length>=2||prior.length&&prior[0].correct)continue;answers.push({qid:a.qid,selected:a.selected,at:a.at,correct:a.selected===q.answer,delta:a.delta,recovered:a.recovered===true});}
  answers.sort((a,b)=>a.at-b.at);seen.add(r.id);state.runs.push({id:r.id,student:r.student,name:typeof r.name==='string'?r.name.slice(0,20):'',lecture:r.lecture,track:['Wiki','J','JBL'].includes(r.track)?r.track:'',at:r.at,qids:[...r.qids],order:order.map(x=>[...x]),answers});
 }return state;
}
export function reviewHistory(state){return state.runs.flatMap(r=>r.answers.map((a,i)=>({...a,id:r.id+':'+i,student:r.student,lecture:r.lecture,runId:r.id}))).sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id));}
export function reviewBond(state,student){return reviewHistory(state).filter(a=>a.student===student).reduce((n,a)=>n+a.delta,0);}
export const reviewQuestion=id=>byId.get(id);
export function pendingQuestion(run){return run.qids.find(id=>!run.answers.some(a=>a.qid===id))||null;}
export function reviewSummary(run){const first=run.qids.map(id=>run.answers.find(a=>a.qid===id)).filter(Boolean);return {answered:first.length,total:run.qids.length,correct:first.filter(a=>a.correct).length,delta:run.answers.reduce((n,a)=>n+a.delta,0),wrong:run.qids.filter(id=>{const a=run.answers.filter(a=>a.qid===id);return a.length===1&&!a[0].correct;}),recovered:run.answers.filter(a=>a.recovered).length};}
export function queueReview(state,event,random=Math.random){
 if(!event?.id||!event.student||event.duration<60000)return null;
 const existing=state.runs.find(r=>r.id===event.id);if(existing)return existing;
 const pool=reviewQuestions.filter(q=>q.lecture===Number(event.lecture));if(pool.length<2)return null;
 const chosen=pool.slice(0,(event.duration>=2700000||event.track==='JBL')?3:2),run={id:event.id,student:event.student,name:event.name||'',lecture:Number(event.lecture),track:event.track||'',at:event.at||Date.now(),qids:chosen.map(q=>q.id),order:chosen.map(()=>{const a=[0,1,2];for(let i=2;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}),answers:[]};state.runs.push(run);return run;
}
export function answerReview(state,runId,qid,selected,{now=Date.now(),bond=20,retry=false}={}){
 const run=state.runs.find(r=>r.id===runId),q=byId.get(qid);if(!run||!q||!run.qids.includes(qid)||![-1,0,1,2].includes(selected))return null;
 const prior=run.answers.filter(a=>a.qid===qid);
 if(retry?prior.length!==1||prior[0].correct:prior.length||pendingQuestion(run)!==qid)return null;
 const history=reviewHistory(state).filter(a=>a.student===run.student),today=history.filter(a=>day(a.at)===day(now)),same=today.filter(a=>a.qid===qid),correct=selected===q.answer;
 const debt=Math.max(0,-history.filter(a=>a.qid===qid&&(a.delta<0||a.recovered)).reduce((n,a)=>n+a.delta,0));
 let delta=0,recovered=false;
 if(correct){if(debt){delta=Math.min(2,debt);recovered=true;}else if(!retry&&!same.some(a=>a.correct)&&today.filter(a=>a.delta>0&&!a.recovered).length<6)delta=1;}
 else if(!retry&&!same.some(a=>!a.correct)){const remaining=Math.max(0,6+today.reduce((n,a)=>n+Math.min(0,a.delta),0));delta=-Math.min(2,remaining,Math.max(0,Math.floor(bond)))||0;}
 const result={qid,selected,at:now,correct,delta,recovered};run.answers.push(result);return result;
}
export function mergeReview(current,incoming){
 const a=normalizeReview(current),b=normalizeReview(incoming),map=new Map(a.runs.map(r=>[r.id,r]));
 for(const r of b.runs){const old=map.get(r.id);if(!old){map.set(r.id,r);continue;}if(old.student!==r.student||old.lecture!==r.lecture||old.qids.join()!==r.qids.join())continue;for(const qid of old.qids){const x=old.answers.filter(a=>a.qid===qid),y=r.answers.filter(a=>a.qid===qid);if(y.length>x.length&&(!x.length||x[0].at===y[0].at&&x[0].selected===y[0].selected)){old.answers=old.answers.filter(a=>a.qid!==qid).concat(y);}}}
 return normalizeReview({runs:[...map.values()].sort((a,b)=>a.at-b.at)});
}
