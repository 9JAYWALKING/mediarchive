import {studyTargets,completedTargets,allocatedTargets} from './linked-study.js?v=20261110';
import {schedule} from './schedule-data.js';
import {haruLessons,tracks,koreanDate,validDate} from './game-state.js';
// Balance v1: estimates for game rewards, not measured concentration or exam difficulty.
export const growthUnits=haruLessons.flatMap(lecture=>tracks.map(track=>({id:`${lecture}:${track}`,lecture,track})));
export const referenceMinutes={1:{Wiki:45,J:25,JBL:20},2:{Wiki:50,J:25,JBL:20},6:{Wiki:60,J:35,JBL:25}};
const MIN=60000,DAY=86400000;
export const unitKey=c=>c&&haruLessons.includes(c.lecture)&&tracks.includes(c.track)?`${c.lecture}:${c.track}`:null;
export const memoryKey=m=>`${new Date(m.date).toISOString()}|${m.duration}`;
export function sessionTotals(session,now=Date.now()){
 if(!session)return {duration:0,preview:0};
 const running=session.started?Math.max(0,now-session.started):0;
 const lesson=schedule.find(l=>l.id===session.context?.lecture);
 const boundary=lesson?Date.parse(`${lesson.date}T${lesson.time}:00+09:00`):0;
 const extra=lesson&&session.started?Math.max(0,Math.min(now,boundary)-session.started):0;
 const duration=Math.round(Math.max(0,session.elapsed||0)+running);
 return {duration,preview:Math.round(Math.min(duration,Math.max(0,session.previewElapsed||0)+Math.min(running,extra)))};
}
export function normalizeGrowth(raw){
 const events=[],ids=new Set(),sessions=new Set();
 for(const e of Array.isArray(raw?.events)?raw.events:[]){
  if(!e||typeof e.id!=='string'||e.id.length>180||!Number.isFinite(e.at)||e.at<0||e.at>8640000000000000||!Number.isFinite(e.duration)||e.duration<1000||e.duration>7*DAY)continue;
  const key=`${new Date(e.at).toISOString()}|${e.duration}`;
  if(ids.has(e.id)||sessions.has(key))continue;
  const context=unitKey(e.context)?{lecture:e.context.lecture,track:e.context.track}:undefined;
  const cycle=Number.isInteger(e.cycle)&&e.cycle>=1&&e.cycle<=5?e.cycle:1;
  const targets=studyTargets(e).filter(t=>haruLessons.includes(t.lecture));
  events.push({targets,completed:completedTargets({...e,targets}).filter(k=>targets.some(t=>`${t.lecture}:${t.track}`===k)),id:e.id,at:e.at,duration:e.duration,preview:context?Math.max(0,Math.min(e.duration,Number(e.preview)||0)):0,...(context?{context}:{}),cycle,mode:e.mode==='familiar'?'familiar':'new',complete:!!context&&e.complete===true&&e.duration>=MIN});
  ids.add(e.id);sessions.add(key);
 }
 return {version:1,events:events.sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id))};
}
export function reconcileGrowth(raw,memories){
 const data=normalizeGrowth(raw),seen=new Set(data.events.map(e=>`${new Date(e.at).toISOString()}|${e.duration}`));
 for(const m of memories){const key=memoryKey(m);if(seen.has(key)||m.duration<1000)continue;seen.add(key);
  // Historic time is retained, but completion and preview must never be invented.
  data.events.push({id:m.id||'legacy:'+key,at:Date.parse(m.date),duration:m.duration,preview:0,cycle:1,mode:'new',complete:false,...(unitKey(m.context)?{context:m.context}:{})});
 }
 return normalizeGrowth(data);
}
export function mergeGrowth(a,b,memories){return reconcileGrowth({events:[...normalizeGrowth(a).events,...normalizeGrowth(b).events]},memories);}
export function xpLevel(xp){
 const value=Math.max(0,xp),level=Math.min(50,Math.floor((Math.sqrt(1+value/12.5)-1)/2)+1),floor=50*(level-1)*level,next=50*level*(level+1);
 return {level,xp:Math.floor(value),progress:level===50?1:(value-floor)/(next-floor),remaining:level===50?0:Math.ceil(next-value)};
}
export function summarizeGrowth(raw){
 const data=normalizeGrowth(raw),coverage=Array.from({length:5},()=>new Set()),unitTime=new Map(),abilities={Wiki:0,J:0,JBL:0};
 let xp=0;const rewards={};
 for(const e of data.events){
  const parts=e.targets?.length?allocatedTargets(e):[{...e,lecture:e.context?.lecture,track:e.context?.track}];
  let reward={base:0,preview:0,completion:0,focus:0,total:0,accepted:false};
  for(const part of parts){
   const context={lecture:part.lecture,track:part.track},unit=unitKey(context),key=`${e.cycle}/${unit}`,time=(unitTime.get(key)||0)+part.duration;unitTime.set(key,time);
   const base=part.duration/MIN*10,preview=part.preview/MIN*5;let completion=0,focus=0,accepted=false;
   if(part.complete&&unit&&!coverage[e.cycle-1].has(unit)){
    const reference=referenceMinutes[context.lecture][context.track]*(e.mode==='familiar'?.45:1);completion=reference*2;
    const pace=e.mode==='new'?Math.max(0,Math.min(.15,(reference/(time/MIN)-1)*.12)):0;focus=completion*pace;accepted=true;coverage[e.cycle-1].add(unit);
   }
   const total=base+preview+completion+focus;xp+=total;if(unit)abilities[context.track]+=total;
   for(const [k,v] of Object.entries({base,preview,completion,focus,total}))reward[k]+=v;reward.accepted ||= accepted;
  }rewards[e.id]=reward;
 }

 let cycles=0;while(cycles<5&&coverage[cycles].size===growthUnits.length)cycles++;
 const cycle=Math.min(5,cycles+1),done=[...coverage[cycle-1]],stars=Math.min(3,cycles),accessory=Math.max(0,cycles-3);
 return {...xpLevel(xp),cycles,cycle,stars,accessory,unlocked:cycles>=3,done,coverage:coverage.map(s=>[...s]),abilities:Object.fromEntries(Object.entries(abilities).map(([k,v])=>[k,xpLevel(v)])),rewards,totalDuration:data.events.reduce((n,e)=>n+e.duration,0),lastAt:data.events.at(-1)?.at||0};
}
export function eventFor(session,{complete=false,now=Date.now()}={}){
 const {duration,preview}=sessionTotals(session,now);
 if(duration<1000)return null;
 return {id:session.id||crypto.randomUUID(),at:now,duration,preview,context:unitKey(session.context)?session.context:undefined,cycle:session.cycle||1,mode:session.mode==='familiar'?'familiar':'new',complete:complete&&duration>=MIN};
}
export function growthReminder(raw,examDate,now=Date.now()){
 const s=summarizeGrowth(raw);if(s.cycles>=3||!validDate(examDate))return null;
 const days=Math.round((Date.parse(examDate+'T00:00:00Z')-Date.parse(koreanDate(now)+'T00:00:00Z'))/DAY);
 if(days<0)return null;
 const remaining=27-s.coverage.slice(0,3).reduce((n,x)=>n+x.length,0);
 const quiet=!s.lastAt||now-s.lastAt>=DAY;
 const urgent=remaining/Math.max(1,days+1)>=2;
 if(!quiet&&!urgent)return null;
 return {line:urgent?'내 옆자리, 아직 비어 있는데? 오늘은 조금 같이 있어 줘.':'오늘은 내 차례도 있는 거지? 네 자리 맡아 뒀어.',unit:growthUnits.find(u=>!s.done.includes(u.id))||growthUnits[0],remaining,days};
}
