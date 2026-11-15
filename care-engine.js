import {normalizeQuests,arrivalPenalty,recordOvertimePenalty,unionDuration,dayStart} from './quest-engine.js?v=20261111overtime';
export {recordOvertimePenalty,unionDuration,dayStart};
export const careKey='mediarchive-care-v1';
export const retiredQuestKey='heart-companion-quests-v1';
// The old schema is read only for migration. No attendance or quest progress is generated.
export function normalizeCare(raw){
 const common=normalizeQuests({overtime:raw?.overtime,rest:raw?.rest,rests:raw?.rests});
 const ledger=new Map();
 for(const r of raw?.bondAdjustments||[]){
  if(typeof r?.id!=='string'||r.id.length>240||typeof r.student!=='string'||!r.student||r.student.length>100||r.delta!==-1||!Number.isFinite(r.at))continue;
  ledger.set(r.id,{id:r.id,student:r.student,delta:-1,at:r.at});
 }
 return {version:1,bondAdjustments:[...ledger.values()],overtime:common.overtime,rest:common.rest,rests:common.rests};
}
export function retireQuests(raw,now=Date.now()){
 const old=normalizeQuests(raw,now),bondAdjustments=[];
 for(const [date,r] of Object.entries(old.arrivals)){
  if(!r.late||r.at>now)continue;
  for(const student of r.students)bondAdjustments.push({id:`retired-arrival:${date}:${student}`,student,delta:-1,at:r.at});
 }
 return normalizeCare({bondAdjustments,overtime:old.overtime,rest:old.rest,rests:old.rests});
}
export function mergeCare(a,b){
 const left=normalizeCare(a),right=normalizeCare(b);
 return normalizeCare({bondAdjustments:[...left.bondAdjustments,...right.bondAdjustments],overtime:[...left.overtime,...right.overtime],rests:[...left.rests,...right.rests],rest:left.rest});
}
export function bondPenalty(state,student,now=Date.now()){
 // Accept legacy snapshots for older statistics callers and backup previews.
 const carry=Array.isArray(state?.bondAdjustments)?state.bondAdjustments.filter(r=>r.student===student&&r.at<=now).reduce((n,r)=>n+r.delta,0):arrivalPenalty(state,student,now);
 return carry-(state?.overtime||[]).filter(r=>r.student===student&&r.at<=now).reduce((n,r)=>n+(r.stage===2?1:2),0);
}
export function loadCare(storage,now=Date.now()){
 const saved=storage.getItem(careKey),legacy=storage.getItem(retiredQuestKey);
 const current=saved?normalizeCare(JSON.parse(saved)):null;
 const migrated=legacy?retireQuests(JSON.parse(legacy),now):normalizeCare(null);
 const state=current?mergeCare(current,migrated):migrated;
 // Commit preserved bond/rest data before removing the obsolete quest key.
 let persisted=true;
 try{storage.setItem(careKey,JSON.stringify(state));if(legacy!==null)storage.removeItem(retiredQuestKey);}catch{persisted=false;}
 return {state,persisted};
}
