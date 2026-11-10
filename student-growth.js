import {studyTargets,completedTargets,allocatedTargets} from './linked-study.js?v=20261110';
import {materialUnits} from './material-scope.js';
import {xpLevel,sessionTotals} from './growth-engine.js?v=20261110';
export function scopeFor(student){return materialUnits.filter(u=>student?.lectures.includes(Number(u.split(':')[0])));}
export function studentGrowth(records,student){
 const events=records.filter(r=>r.student===student.id).sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id)),scope=events.find(r=>r.scope?.length)?.scope||scopeFor(student),coverage=Array.from({length:5},()=>new Set()),abilities={Wiki:0,J:0,JBL:0};
 let xp=0,duration=0,preview=0;const seen=new Set();
 for(const r of events){if(seen.has(r.id))continue;seen.add(r.id);duration+=r.duration;preview+=r.preview||0;const gain=r.duration/6000+(r.preview||0)/12000;xp+=gain;const targets=studyTargets(r);if(targets.length){for(const t of targets)abilities[t.track]+=gain/targets.length;}
  for(const unit of completedTargets(r))if(r.duration>=60000&&scope.includes(unit))coverage[(r.cycle||1)-1]?.add(unit);
 }
 let cycles=0;while(scope.length&&cycles<5&&coverage[cycles].size===scope.length)cycles++;
 const cycle=Math.min(5,cycles+1),bond=20+Math.floor(duration/18000);
 return {...xpLevel(xp),scope,coverage:coverage.map(s=>[...s]),cycles,cycle,stars:Math.min(3,cycles),accessory:Math.max(0,cycles-3),done:[...coverage[cycle-1]],abilities:Object.fromEntries(Object.entries(abilities).map(([k,v])=>[k,xpLevel(v)])),duration,preview,bond};
}
export function recordSnapshot(plan){return {snapshot:true,targets:studyTargets(plan),student:plan?.student||'',lecture:plan?.lecture||null,track:plan?.track||'',title:plan?.title||'개인 일정'};}
export function focusPreview(f,plan,now=Date.now()){
 const targets=studyTargets(f).length?studyTargets(f):studyTargets(plan);if(!targets.length)return sessionTotals({elapsed:f.elapsed,started:f.started,previewElapsed:f.previewElapsed||0,context:{lecture:f.lecture??plan.lecture}},now).preview;const running=f.started?Math.max(0,now-f.started):0;const extra=targets.length?targets.reduce((n,t)=>n+sessionTotals({elapsed:0,started:f.started,context:{lecture:t.lecture}},now).preview,0)/targets.length:0;return Math.min(f.elapsed+running,(f.previewElapsed||0)+extra);
}
