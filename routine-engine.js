import {schedule} from './schedule-data.js';
import {mealContext,mealDay,mealsForDate} from './meals-engine.js';
const minuteOf=l=>Number(l.time.slice(0,2))*60+Number(l.time.slice(3));
export const phaseLabels={sleep:'취침',wake:'기상',morning:'아침',class:'수업',lunch:'점심',break:'휴식',review:'복습',dinner:'저녁',evening:'저녁 일정',home:'귀가',bed:'취침 준비'};
export function routineContext(now=Date.now(),lessons=schedule,meals=null){
 const local=new Date(now+9*3600000),date=local.toISOString().slice(0,10),minute=local.getUTCHours()*60+local.getUTCMinutes();
 const today=lessons.filter(l=>l.date===date).map(l=>({...l,start:minuteOf(l),end:minuteOf(l)+l.hours*60})).sort((a,b)=>a.start-b.start);
 const current=today.find(l=>minute>=l.start&&minute<l.end),next=today.find(l=>l.start>minute),ended=today.filter(l=>l.end<=minute),last=ended.at(-1);
 const blocks=[];for(const l of today){const b=blocks.at(-1);if(b&&l.start<=b.end)b.end=Math.max(b.end,l.end);else blocks.push({start:l.start,end:l.end});}
 const endedBlock=blocks.filter(b=>b.end<=minute).at(-1),lateBlock=blocks.find(b=>b.start<1140&&b.end>1080);
 const dinnerStart=lateBlock?Math.max(1080,lateBlock.end):1080,dinnerEnd=Math.max(1140,dinnerStart+45);
 const gap=next?next.start-minute:Infinity;
 const configured=meals&&mealDay(meals,date).configured,mealEvent=mealContext(meals,now),eating=mealEvent&&['during','ending'].includes(mealEvent.stage);
 const dinner=meals?mealsForDate(meals,date).find(m=>m.id==='dinner'):null;const eveningStart=configured&&dinner?(dinner.until-Date.parse(date+'T00:00:00+09:00'))/60000:dinnerEnd;
 let phase;
 if(eating)phase=mealEvent.meal.id==='dinner'?'dinner':'lunch';
 else if(minute<300)phase='sleep';
 else if(minute<390)phase='wake';
 else if(current)phase='class';
 else if(minute>=1380)phase='bed';
 else if(minute>=1320)phase='home';
 else if(!configured&&minute>=dinnerStart&&minute<dinnerEnd)phase='dinner';
 else if(!configured&&minute>=690&&minute<840&&gap>=20)phase='lunch';
 else if(endedBlock&&minute-endedBlock.end<20)phase='break';
 else if(minute>=eveningStart)phase='evening';
 else if(minute<720&&!ended.length)phase='morning';
 else phase='review';
 const event=mealEvent&&!['class','sleep','bed','home'].includes(phase)?mealEvent:null;
 return {date,minute,phase,mealsConfigured:configured,mealEvent:event,key:event?`meal:${event.meal.key}:${event.stage}`:`${date}:${phase}:${phase==='class'?current.id:phase==='break'?endedBlock.end:''}`,today,current,next,last,ended,noClass:!today.length,dinnerStart,dinnerEnd,remaining:Math.max(0,1320-minute),pathologyAfter:ended.some(l=>l.id>=14&&l.id<=17),lateDinner:dinnerStart>1080};
}
// A shared gate prevents a lobby/gallery switch or reload from repeating an automatic prompt.
export function routineDue(ctx,history,now,{blocked=false,quiet=false,visible=true,lastInteraction=0}={}){
 if(blocked||quiet||!visible||now-lastInteraction<90000)return false;
 const recent=Number(history.lastAt)||0;
 const spacing=ctx.mealEvent&&['before','ending'].includes(ctx.mealEvent.stage)?3*60000:20*60000;
 if(now<recent||now-recent<spacing)return false;
 return !history.seen?.includes(ctx.key);
}
