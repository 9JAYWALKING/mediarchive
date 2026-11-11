export function shuffled(values,random=Math.random){const out=[...values];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
export function createRecallRun(lecture,shuffle=false,saved=null,random=Math.random){
 const ids=lecture.questions.map(q=>q.id),valid=new Set(ids);
 const order=saved?.shuffle===shuffle&&Array.isArray(saved.order)&&saved.order.length===ids.length&&new Set(saved.order).size===ids.length&&saved.order.every(id=>valid.has(id))?[...saved.order]:shuffle?shuffled(ids,random):ids;
 const position=saved?.current?order.indexOf(saved.current):-1;
 return {lecture:lecture.id,order,index:Math.max(0,position),shuffle,phase:'question'};
}
export function toggleRecallShuffle(run,lecture,enabled,random=Math.random){
 if(enabled===run.shuffle)return {...run};const current=run.order[run.index];
 if(!enabled){const order=lecture.questions.map(q=>q.id);return {...run,order,index:order.indexOf(current),shuffle:false};}
 const prefix=run.order.slice(0,run.index+1);return {...run,order:[...prefix,...shuffled(run.order.slice(run.index+1),random)],shuffle:true};
}
export function normalizeRecallState(raw,lectures){
 const result={version:1,shuffle:raw?.shuffle===true,student:typeof raw?.student==='string'?raw.student:'',lectures:{},ratings:{}};
 for(const l of lectures)for(const q of l.questions){const r=raw?.ratings?.[q.id];if(r&&['circle','triangle','cross'].includes(r.mark)&&Number.isFinite(r.at))result.ratings[q.id]={mark:r.mark,at:r.at,attempts:Math.max(1,Math.min(100000,Math.floor(Number(r.attempts)||1)))};}
 for(const l of lectures){const saved=raw?.lectures?.[l.id];if(!saved)continue;const ids=new Set(l.questions.map(q=>q.id));result.lectures[l.id]={seen:[...new Set((Array.isArray(saved.seen)?saved.seen:[]).filter(id=>ids.has(id)))],current:ids.has(saved.current)?saved.current:null,order:Array.isArray(saved.order)?saved.order.filter(id=>ids.has(id)):[],shuffle:saved.shuffle===true,updatedAt:Number.isFinite(saved.updatedAt)?saved.updatedAt:0};}
 return result;
}
export function mergeRecallState(a,b,lectures){const left=normalizeRecallState(a,lectures),right=normalizeRecallState(b,lectures);for(const l of lectures){const x=left.lectures[l.id],y=right.lectures[l.id];if(y)left.lectures[l.id]=x?{...(y.updatedAt>x.updatedAt?y:x),seen:[...new Set([...x.seen,...y.seen])]}:y;}for(const [id,r] of Object.entries(right.ratings))if(!left.ratings[id]||r.at>left.ratings[id].at)left.ratings[id]=r;return left;}
export function reviewQuestions(lectures,ratings,{student='all',lecture='all',marks=['triangle','cross']}={}){return lectures.filter(l=>(student==='all'||l.student===student)&&(lecture==='all'||String(l.id)===String(lecture))).flatMap(l=>l.questions.filter(q=>marks.includes(ratings[q.id]?.mark)));}
export function recallFeedback(marks){const score=marks.reduce((s,m)=>s+(m==='circle'?1:m==='triangle'?.5:0),0)/Math.max(1,marks.length);return score>=.75?'good':score<.4?'hard':'steady';}
