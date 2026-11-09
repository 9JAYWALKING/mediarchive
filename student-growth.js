import {materialUnits} from './material-scope.js';
import {xpLevel,sessionTotals} from './growth-engine.js';
export function scopeFor(student){return materialUnits.filter(u=>student?.lectures.includes(Number(u.split(':')[0])));}
export function studentGrowth(records,student){
 const events=records.filter(r=>r.student===student.id).sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id)),scope=events.find(r=>r.scope?.length)?.scope||scopeFor(student),coverage=Array.from({length:5},()=>new Set()),abilities={Wiki:0,J:0,JBL:0};
 let xp=0,duration=0,preview=0;const seen=new Set();
 for(const r of events){if(seen.has(r.id))continue;seen.add(r.id);duration+=r.duration;preview+=r.preview||0;const gain=r.duration/6000+(r.preview||0)/12000;xp+=gain;if(r.track in abilities)abilities[r.track]+=gain;
  const unit=`${r.lecture}:${r.track}`;if(r.unitComplete&&r.duration>=60000&&scope.includes(unit))coverage[(r.cycle||1)-1]?.add(unit);
 }
 let cycles=0;while(scope.length&&cycles<5&&coverage[cycles].size===scope.length)cycles++;
 const cycle=Math.min(5,cycles+1),bond=20+Math.floor(duration/18000);
 return {...xpLevel(xp),scope,coverage:coverage.map(s=>[...s]),cycles,cycle,stars:Math.min(3,cycles),accessory:Math.max(0,cycles-3),done:[...coverage[cycle-1]],abilities:Object.fromEntries(Object.entries(abilities).map(([k,v])=>[k,xpLevel(v)])),duration,preview,bond};
}
export function recordSnapshot(plan){return {snapshot:true,student:plan?.student||'',lecture:plan?.lecture||null,track:plan?.track||'',title:plan?.title||'개인 일정'};}
export function focusPreview(f,plan,now=Date.now()){
 return sessionTotals({elapsed:f.elapsed,started:f.started,previewElapsed:f.previewElapsed||0,context:{lecture:f.lecture??plan.lecture}},now).preview;
}
