import {normalizeChoice} from './game-state.js';
import {reconcileGrowth,mergeGrowth,sessionTotals,memoryKey,unitKey} from './growth-engine.js?v=20261110';
export function normalizeMemories(raw){
 const map=new Map();for(const m of Array.isArray(raw)?raw:[]){
  if(!m||!Number.isFinite(m.duration)||m.duration<0||m.duration>604800000||typeof m.date!=='string'||!Number.isFinite(Date.parse(m.date)))continue;
  const entry={date:new Date(m.date).toISOString(),duration:m.duration,...(typeof m.id==='string'&&m.id.length<=180?{id:m.id}:{}),...(unitKey(m.context)?{context:{lecture:m.context.lecture,track:m.context.track}}:{})};map.set(memoryKey(entry),entry);
 }return [...map.values()].sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));
}
export function normalizeStudy(raw){
 const memories=normalizeMemories(raw?.memories),s=raw?.session;let session=null;
 if(s&&Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<=604800000){session={elapsed:s.elapsed,started:null,...(typeof s.planId==='string'&&s.planId.length<=160?{planId:s.planId}:{}),...(s.context?{context:normalizeChoice(s.context)}:{}),previewElapsed:Math.max(0,Math.min(s.elapsed,Number(s.previewElapsed)||0)),id:typeof s.id==='string'&&s.id.length<180?s.id:crypto.randomUUID(),cycle:Number.isInteger(s.cycle)&&s.cycle>=1&&s.cycle<=5?s.cycle:1,mode:s.mode==='familiar'?'familiar':'new'};}
 return {memories,session,growth:reconcileGrowth(raw?.growth,memories)};
}
export function studySnapshot(state,now=Date.now()){
 const totals=sessionTotals(state.session,now);
 return {...state,version:2,session:state.session?{...state.session,elapsed:totals.duration,previewElapsed:totals.preview,started:null}:null};
}
export function mergeStudy(state,incoming){
 const memories=normalizeMemories([...state.memories,...normalizeMemories(incoming.memories)]);
 return {...state,memories,growth:mergeGrowth(state.growth,incoming.growth,memories)};
}
