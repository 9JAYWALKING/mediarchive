import {schedule} from './schedule-data.js';
export const materialTracks=['Wiki','J','JBL'];
export const targetKey=t=>`${t.lecture}:${t.track}`;
export function studyTargets(raw){
 const source=Array.isArray(raw?.targets)?raw.targets:raw?.lecture&&raw?.track?[raw]:[];
 const seen=new Set();return source.filter(t=>schedule.some(l=>l.id===Number(t?.lecture))&&materialTracks.includes(t?.track)).map(t=>({lecture:Number(t.lecture),track:t.track})).filter(t=>{const k=targetKey(t);if(seen.has(k))return false;seen.add(k);return true;});
}
export function completedTargets(raw){const allowed=new Set(studyTargets(raw).map(targetKey));return [...new Set(Array.isArray(raw?.completed)?raw.completed:raw?.unitComplete||raw?.complete?[`${raw.lecture??raw.context?.lecture}:${raw.track??raw.context?.track}`]:[])].filter(k=>allowed.has(k));}
export function linkedTitle(raw){const ids=[...new Set(studyTargets(raw).map(t=>t.lecture))];if(!ids.length&&raw?.lecture)ids.push(raw.lecture);return ids.map(id=>schedule.find(l=>l.id===id)?.title).filter(Boolean).join(' · ')||'개인 일정';}
export function linkedLabel(raw){return studyTargets(raw).map(t=>`${t.lecture}강 ${t.track}`).join(' · ');}
// Each saved session owns one duration. Allocation never creates new study time.
export function allocatedTargets(raw){const targets=studyTargets(raw),done=new Set(completedTargets(raw));return targets.map(t=>({...t,duration:raw.duration/targets.length,preview:(raw.preview||0)/targets.length,complete:done.has(targetKey(t))}));}
