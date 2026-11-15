import {guidePortrait} from './guide-dm-ui.js?v=20261116guideDM2';
import {guideDMCopy} from './guide-dm-copy.js?v=20261116guideDM2';
import {studyDays,routeUnit,studentVoices,routeSources} from './study-route-data.js?v=20261116guideDM2';
import {buildRoute,normalizeRoute,mergeRoute,routeKey,routeFocus,unitMinutes,dayMinute,clock} from './study-route-engine.js?v=20261116guideDM2';
import {koreanDate,shiftDate} from './game-state.js';
import {reviewQuestions} from './review-data.js';
import {defaultStudents} from './planner-catalog.js?v=20261115akariVoice1';
import {schedule} from './schedule-data.js?v=20261116guideDM2';
import {classTime} from './class-time.js';

export function snapshotBeforeRoute(storage){
 try{storage??=globalThis.localStorage;const key='mediarchive-before-new-v1';if(storage.getItem(key))return true;
 const values={};for(let i=0;i<storage.length;i++){const k=storage.key(i);if(/^(heart-companion|mediarchive)/.test(k)&&k!==key)values[k]=storage.getItem(k);}
 storage.setItem(key,JSON.stringify({at:Date.now(),values}));return true;}catch{return false;}
}
export function createStudyRoute({planner,say,selectStudent,openModal,closeModal,toast,getSession,pauseLegacy,getLobby,blocked,quiet,onSchedule,onChange,onCard=()=>{},onMessage=()=>{},inConversation=()=>false,onOpenDM=()=>{}}){
 let state;try{state=normalizeRoute(JSON.parse(localStorage.getItem(routeKey)||'null'));}catch{state=normalizeRoute(null);}
 const $=s=>document.querySelector(s),node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 const student=id=>planner.state.settings.students.find(s=>s.id===id)||defaultStudents.find(s=>s.id===id),voice=id=>studentVoices[id]||studentVoices.haru;
 const bar=node('div',undefined,'routeBar'),overview=node('button','오늘 흐름'),meal=node('button','식사');overview.onclick=()=>openDay();meal.onclick=()=>mealAction();bar.append(overview,meal);$('.session').prepend(bar);
 function save(next){try{localStorage.setItem(routeKey,JSON.stringify(next));state=next;return true;}catch{toast('안내 기록을 저장하지 못했어. 설정에서 먼저 내보내 줘.');return false;}}
 let routeCache=null,cacheKeys=[];
 function current(now=Date.now()){if(!state.enabled)return null;const keys=[Math.floor(now/60000),state,planner.state,classTime.released(now)];if(keys.some((v,i)=>v!==cacheKeys[i])){cacheKeys=keys;routeCache=buildRoute(koreanDate(now),state,planner.state,{now,lessons:classTime.lessons(now),releasedAt:classTime.released(now)&&classTime.current(now)?.time<'14:00'?Math.max(660,dayMinute(now)):undefined});}return routeCache;}
 function line(unit,kind='start'){selectStudent(unit.student);say({text:kind==='start'?unit.goal:voice(unit.student)[kind],expression:kind==='again'?'thinking':'smile',group:'route'});}
 function start(block=current()?.current){
  const route=current();if(!route)return false;
  if(state.activeMeal){mealAction();return true;}
  if(route.before||route.after){say({text:route.before?'아직 일찍이네. 오늘은 7시부터 시작하자. 아침부터 챙겨 먹고 와.':voice(getLobby()).end,expression:'smile',group:'route'});return true;}
  if(planner.focus||getSession()){toast('진행 중인 시간을 먼저 마쳐 줘.');return true;}
  if(block?.kind==='meal'){mealAction(block.meal);return true;}
  if(block?.kind==='plan'){planner.start(planner.state.plans.find(p=>p.id===block.planId));return true;}
  if(block?.kind!=='study'){brief();return true;}
  closeModal();if(planner.startGuided(block.unit,block.minutes)){onMessage({id:planner.focus.id+':start',student:block.unit.student,text:voice(block.unit.student).start,kind:'start',silent:true});line(block.unit);}return true;
 }
 function brief(){const route=current(),f=routeFocus(planner.state);if(f){line(f);return true;}if(!route)return false;const b=route.current;
  if(route.before||route.after)return start();
  if(state.activeMeal){say({text:'밥부터 편하게 먹고 와. 다 먹으면 다음 순서 같이 보자.',expression:'smile',group:'route'});return true;}
  if(b?.kind==='study'){line(b.unit);return true;}
  if(b?.kind==='class'){const owner=defaultStudents.find(s=>s.lectures.includes(b.lectures[0]));if(owner)selectStudent(owner.id);say({text:'지금은 '+b.title+' 수업이야. 강조한 조건과 마지막 퀴즈만 표시해 둬. 끝나면 다음 순서 같이 보자.',expression:'thinking',group:'route'});return true;}
  say({text:b?.kind==='meal'?'수업 끝났으면 밥부터 먹으러 갈까? 다녀오면 다음 순서로 이어 가자.':b?.kind==='rest'?'잠깐 눈 쉬자. 물도 마시고. 돌아오면 이어 가면 돼.':voice(getLobby()).end,expression:'smile',group:'route'});return true;
 }
 function mealAction(kind){
  if(state.activeMeal){const now=Date.now(),a=state.activeMeal,duration=now-a.start;if(duration>86400000){if(save({...state,activeMeal:null}))toast('지난 식사는 닫았어. 실제 공부 기록은 그대로야.');return;}
   if(!save({...state,activeMeal:null,meals:[...state.meals,{...a,end:now}]}))return;
   if(duration>=300000&&duration<=10800000&&koreanDate(a.start)===koreanDate(now)&&a.kind!=='other')planner.recordMeal(koreanDate(now),{id:a.kind,start:clock(dayMinute(a.start)),end:clock(dayMinute(now))});
   onMessage({id:'meal:'+a.start+':back',student:getLobby(),text:copy(getLobby()).back,kind:'meal',silent:true});onChange();if(!inConversation())say({text:copy(getLobby()).back,expression:'smile',group:'route'});return;
  }
  const proposed=kind|| (dayMinute(Date.now())>=960?'dinner':'lunch');
  openModal('<div class="routeSheet"><span class="routeEyebrow">잠깐 다녀오기</span><h2>식사</h2><p>다 먹고 돌아오면 남은 순서를 다시 잡을게.</p><div id="routeMealChoices" class="routeChoices"></div></div>');
  for(const [id,label] of [['lunch','점심'],['dinner','저녁'],['other','간단히']]){const b=node('button',label,'action'+(id===proposed?' solid':''));b.onclick=()=>{planner.pauseForRest();pauseLegacy();if(save({...state,activeMeal:{kind:id,start:Date.now()}})){closeModal();onChange();say({text:'다녀와. 밥 먹는 동안엔 타이머도 쉬고 있을게.',expression:'smile',group:'route'});}};$('#routeMealChoices').append(b);}
  const eaten=node('button',(proposed==='dinner'?'저녁':'점심')+'은 이미 먹었어','routeText');eaten.onclick=()=>{const now=Date.now();if(save({...state,meals:[...state.meals,{kind:proposed,start:now,end:now,reported:true}]})){closeModal();onChange();brief();}};$('.routeSheet').append(eaten);
 }
 let pendingKeys=[],pendingCache;
 function pending(){const keys=[planner.state.records,planner.state.plans,state.reviewed];if(keys.some((v,i)=>v!==pendingKeys[i])){pendingKeys=keys;const guided=new Set(planner.state.plans.filter(p=>p.sourceId?.startsWith('guide:')).map(p=>p.id)),seen=new Set(state.reviewed);pendingCache=[...planner.state.records].reverse().find(r=>r.duration>=60000&&guided.has(r.planId)&&!seen.has(r.id));}return pendingCache;}
 function check(event=pending()){
  if(!event)return false;const p=planner.state.plans.find(p=>p.id===event.planId),base=routeUnit(p?.sourceId?.slice(6));if(!base)return false;
  const unit={...base,student:p.student,lecture:p.lecture,title:p.title,goal:p.note},bank=reviewQuestions.filter(q=>q.lecture===unit.lecture),count=planner.state.records.filter(r=>r.planId!==event.planId&&planner.state.plans.find(p=>p.id===r.planId)?.sourceId==='guide:'+base.id).length,q=bank[(base.question-1+count)%bank.length];
  if(!inConversation())selectStudent(unit.student);openModal('<div class="routeSheet routeCheck"><span class="routeEyebrow" id="routeCheckWho"></span><h2>한 가지만</h2><p class="routeQuestion" id="routeQuestion"></p><div id="routeAnswer" hidden></div><div id="routeCheckActions"></div></div>');
  $('#routeCheckWho').textContent=student(unit.student).name+' · '+unit.lecture+'강 · 연습';$('#routeCheckWho').classList.add('routeCheckContact');$('#routeCheckWho').prepend(guidePortrait(unit.student));$('#routeQuestion').textContent=q?q.text.replace(/\bEF\b/g,'박출률(EF)').replace(/\bDCM·HCM\b/g,'확장형·비후형 심근병증'):'자료를 덮고, 오늘 본 문제에서 정답을 가르는 단서와 조건이 바뀌면 달라질 판단을 설명해 줘.';
  if(!inConversation())say({text:copy(unit.student).check,expression:'thinking',group:'route'});
  const reveal=node('button','답 보기','action solid');$('#routeCheckActions').append(reveal);
  reveal.onclick=()=>{const box=$('#routeAnswer');box.hidden=false;box.append(node('p',q?q.choices[q.answer]:'답을 고르게 한 단서 → 헷갈리는 답이 아닌 이유 → 조건이 바뀌면 달라질 판단.'),node('p',q?q.explanation:unit.goal,'routeExplanation'));
   const actions=$('#routeCheckActions');actions.replaceChildren();const complete=node('label',undefined,'routeComplete'),input=node('input');input.type='checkbox';input.checked=unitMinutes(base,planner.state)>=base.minutes;complete.append(input,node('span','이 범위는 마쳤어'));actions.append(complete,node('small','내 설명을 답과 비교해 줘. 처음 배우는 중엔 틀려도 괜찮아.','routeHint'));const pair=node('div',undefined,'routeChoices');actions.append(pair);
   for(const [rating,label] of [['again','다시 볼래'],['clear','설명했어']]){const b=node('button',label,'action'+(rating==='clear'?' solid':''));b.onclick=()=>{if(!save({...state,checks:{...state.checks,[base.id]:{rating,done:input.checked,at:Date.now()}},reviewed:[...state.reviewed,event.id],restUntil:Date.now()+600000}))return;closeModal();const reaction=voice(unit.student)[rating==='again'?'again':'praise'];onMessage({id:event.id+':result',student:unit.student,text:(rating==='again'?'「다시 볼래」':'「설명했어」')+'\n'+reaction,kind:'result',silent:true});if(!inConversation())line(unit,rating==='again'?'again':'praise');onChange();};pair.append(b);}
  };return true;
 }
 function finished(event){const p=planner.state.plans.find(p=>p.id===event.planId);if(!p?.sourceId?.startsWith('guide:'))return false;if(event.duration>=60000)onMessage({id:event.id+':check',student:p.student,text:copy(p.student).check,kind:'check'});if(event.duration>=60000&&!document.hidden&&(!classTime.current()||classTime.released())&&!document.querySelector('dialog[open]'))check(event);return true;}
 function finish(){if(!routeFocus(planner.state))return false;planner.finishGuided();return true;}
 function openDay(date=koreanDate()){
  if(!studyDays.some(d=>d.date===date))date=studyDays[0].date;
  const route=buildRoute(date,state,planner.state,{lessons:classTime.lessons(),releasedAt:date===koreanDate()&&classTime.released()&&classTime.current()?.time<'14:00'?Math.max(660,dayMinute(Date.now())):undefined}),isToday=date===koreanDate();
  openModal('<div class="routeSheet"><div class="routeEyebrow">11.16 — 11.25</div><h2>오늘의 흐름</h2><div id="routeDays" class="routeDays"></div><div id="routeOverview"></div><div id="routeTimeline" class="routeTimeline"></div><div id="routeFoot" class="routeFoot"></div></div>');
  for(const d of studyDays){const b=node('button',String(Number(d.date.slice(-2))));b.setAttribute('aria-label',d.date);b.setAttribute('aria-pressed',String(d.date===date));b.onclick=()=>openDay(d.date);$('#routeDays').append(b);}
  const summary=$('#routeOverview');summary.append(node('h3',route.day.title),node('p',`제안 ${Math.floor(route.allocated/60)}시간 ${Math.round(route.allocated%60)}분 · 23:00 마무리`,'routeHint'));
  if(route.unplaced)summary.append(node('p',`오늘 남은 시간에 ${route.unplaced}분은 다 담기 어려워. 약리와 처음 보는 내용을 먼저 두었어.`,'routeAdjustment'));
  if(isToday&&route.pastUnfinished.length){const carry=node('details',undefined,'routeRecall');carry.append(node('summary','남은 범위 · '+route.pastUnfinished.length),node('p','필요한 것만 골라 이어 가자. 오늘 분량에 전부 더하지는 않을게.','routeHint'));for(const u of route.pastUnfinished){const remain=Math.max(5,Math.ceil(u.minutes-unitMinutes(u,planner.state))),b=node('button',`${student(u.student)?.name} · ${u.title} · ${remain}분`,'routeCarry');b.onclick=()=>start({kind:'study',unit:u,minutes:Math.min(50,remain)});carry.append(b);}summary.append(carry);}
  if(isToday&&pending()){const b=node('button','마지막 확인','action');b.onclick=()=>check();summary.append(b);}
  if(isToday){const prev=studyDays.find(d=>d.date===shiftDate(date,-1));if(prev){const recall=node('details',undefined,'routeRecall');recall.append(node('summary','먼저 떠올릴 것'));for(const u of prev.units.filter(u=>state.checks[u.id]?.rating==='again').concat(prev.units).filter((u,i,a)=>a.findIndex(x=>x.id===u.id)===i).slice(0,3))recall.append(node('p',u.title+' · '+u.goal));summary.append(recall);}}
  if(route.after&&isToday)summary.append(node('p','오늘은 여기까지. 내일 다시 볼 부분만 남기고 쉬자.','routeAdjustment'));
  for(const b of route.rows){const row=node('article',undefined,'routeItem');row.dataset.kind=b.kind;const time=node('div',undefined,'routeTime');time.append(node('b',clock(b.start)),node('small',clock(b.end)));const body=node('div',undefined,'routeBody');row.append(time,body);
   if(b.kind==='study'){body.style.setProperty('--route-color',student(b.unit.student)?.color||'#6ba6b0');body.append(node('small',`${student(b.unit.student)?.name} · ${b.unit.lecture}강 · ${b.unit.material}`),node('h3',b.title),node('span',routeSources(b.unit.lecture),'routeSources'));const details=node('details');details.append(node('summary','핵심'),node('p',voice(b.unit.student).start+' '+b.unit.goal));body.append(details);if(isToday&&route.current===b&&!planner.focus&&!getSession()&&!state.activeMeal&&!route.before&&!route.after){const button=node('button','시작','routeInline');button.onclick=()=>start(b);body.append(button);}}
   else{body.append(node('small',b.kind==='class'?'수업':b.kind==='plan'?'내 약속':b.kind==='meal'?(b.actual?'식사':'식사 · 조정 가능'):'휴식'),node('h3',b.title));if(b.kind==='meal'&&isToday){const button=node('button',state.activeMeal?'다 먹었어':'먹으러 갈게','routeInline');button.onclick=()=>mealAction(b.meal);body.append(button);}}
   $('#routeTimeline').append(row);
  }
  const manual=node('button','내 일정','action');manual.onclick=()=>{closeModal();onSchedule(date);};const toggle=node('button',state.enabled?'안내 잠시 끄기':'안내 켜기','routeText');toggle.onclick=()=>{if(save({...state,enabled:!state.enabled})){closeModal();onChange();}};$('#routeFoot').append(manual,toggle);
 }
 const copy=id=>guideDMCopy[id]||guideDMCopy.haru;
 function card(){
  const r=current();if(!r)return null;
  const now=Date.now(),day=koreanDate(now),f=routeFocus(planner.state),b=r.current;
  let owner=f?.student||b?.unit?.student||getLobby();
  const make=(kind,id,title,text,action,label,extra={})=>({kind,id,noticeId:id,student:owner,title,text,action,label,...extra});
  if(state.activeMeal)return make('eating','meal:'+state.activeMeal.start,'식사 중',copy(owner).meal,'meal','돌아왔어');
  if(r.before||r.after)return make('rest',day+(r.before?':morning':':night'),r.before?'07:00부터':'오늘은 여기까지',r.before?copy(owner).ready:voice(owner).end,'day','일정');
  if(b?.kind==='class'&&!classTime.released()){
   owner=defaultStudents.find(s=>s.lectures.includes(b.lectures[0]))?.id||owner;
   return make('class',day+':class:'+b.start,b.title,copy(owner).class,'day','일정',{time:clock(b.start)+'–'+clock(b.end)});
  }
  if(f){const p=planner.state.plans.find(p=>p.id===planner.focus.planId);return make('focus',planner.focus.id,p.title,planner.focus.started?voice(owner).middle:copy(owner).resume,planner.focus.started?'finish':'resume',planner.focus.started?'마무리':'재개',{goal:p.note,material:f.material,time:p.time+'–'+clock(Math.min(1380,dayMinute(Date.parse(p.date+'T'+p.time+':00+09:00'))+p.minutes)),unitId:f.id});}
  if(getSession()||planner.focus)return null;
  const event=pending();if(event){const p=planner.state.plans.find(p=>p.id===event.planId);owner=p.student;return make('check',event.id+':check',p.title,copy(owner).check,'check','확인',{goal:p.note});}
  if(b?.kind==='study')return make('study',day+':guide:'+b.unit.id,b.title,voice(owner).start,'start','시작',{unitId:b.unit.id,goal:b.unit.goal,material:b.unit.material,lecture:b.unit.lecture,minutes:b.minutes,time:clock(b.start)+'–'+clock(b.end),sources:routeSources(b.unit.lecture)});
  if(b?.kind==='meal')return make('meal',day+':meal:'+b.meal,'식사부터 할까?',copy(owner).meal,'meal','식사',{meal:b.meal,time:clock(b.start)+'–'+clock(b.end)});
  if(b?.kind==='plan'){owner=planner.state.plans.find(p=>p.id===b.planId)?.student||owner;return make('plan',b.planId,b.title,voice(owner).start,'start','시작',{time:clock(b.start)+'–'+clock(b.end)});}
  return make('rest',day+':rest:'+Math.floor((state.restUntil||0)/60000),'잠깐 쉬기',copy(owner).rest,'day','일정');
 }
 function act(expected){
  const c=card();if(!c||c.id!==expected){onCard(c);toast('지금 일정으로 바뀌었어. 다시 확인해 줘.');return;}
  if(c.action==='start')start();else if(c.action==='check')check();else if(c.action==='finish')finish();else if(c.action==='resume')planner.resumeFocus(true);else if(c.action==='meal'){
   if(state.activeMeal)mealAction();else beginMeal(c.meal|| (dayMinute(Date.now())>=960?'dinner':'lunch'));
  }else openDay();
  onChange();
 }
 function deferMeal(expected){
  const c=card();if(!c||c.id!==expected||c.kind!=='meal')return;
  const until=Date.now()+30*60000,key=koreanDate()+':'+c.meal;
  if(save({...state,mealDeferrals:{...state.mealDeferrals,[key]:until}})){onMessage({id:c.id+':later:'+until,student:c.student,text:'「30분 뒤」\n'+copy(c.student).later,kind:'notice',silent:true});onChange();}
 }
 function beginMeal(kind){
  if(state.activeMeal)return;planner.pauseForRest();pauseLegacy();
  if(save({...state,activeMeal:{kind,start:Date.now()}})){onMessage({id:'meal:'+state.activeMeal.start,student:getLobby(),text:copy(getLobby()).meal,kind:'meal',silent:true});onChange();}
 }
 let minuteStamp='',lastSignalAt=0;
 let inTick=false;
 function tick(){if(inTick)return;inTick=true;try{tickInner();}finally{inTick=false;}}
 function tickInner(){
  const now=Date.now(),route=current(now),f=routeFocus(planner.state);onCard(card());bar.hidden=!route&&!studyDays.some(d=>d.date===koreanDate(now));overview.textContent=state.enabled?(pending()?'오늘 흐름 · 확인':'오늘 흐름'):'안내 켜기';meal.textContent=state.activeMeal?'다 먹었어':'식사';
  $('.phone').classList.toggle('hasStudyRoute',!!route);if(f&&planner.focus?.stopAt&&now>=planner.focus.stopAt){planner.finishGuided(planner.focus.stopAt);return;}if(!route){$('#start span').textContent='시작';return;}
  const b=route.current,idle=!planner.focus&&!getSession();
  if(idle){$('#start span').textContent=state.activeMeal?'다 먹었어':route.before||route.after?'안내':b?.kind==='meal'?'식사':['class','rest'].includes(b?.kind)?'확인':'시작';$('#contextStudent').textContent=b?.unit?student(b.unit.student)?.name:'지금';$('#contextTrack').textContent=b?.unit?`${b.unit.lecture}강 · ${b.unit.material}`:route.after?'마무리':route.before?'07:00':b?.kind==='class'?'수업':'다음';$('#contextName').textContent=state.activeMeal?'편하게 먹고 와':route.after?'오늘은 여기까지':route.before?'7시부터 함께 시작':b?.title||'오늘은 여기까지';$('#eventContext').setAttribute('aria-label','오늘의 흐름과 핵심 보기');}
  const task=card();if(task){$('#eventContext').disabled=false;$('#eventContext').setAttribute('aria-label',student(task.student)?.name+' DM · '+task.title);$('#contextStudent').textContent=student(task.student)?.name;$('#contextTrack').textContent=task.kind==='check'?'확인':task.kind==='focus'?'진행 중':task.material||'DM';$('#contextName').textContent=task.title;if(idle)$('#start span').textContent=task.label;}
  // Pause at the day boundary even if the tab slept; count only through 23:00.
  if(f&&planner.focus?.started){const p=planner.state.plans.find(p=>p.id===planner.focus.planId),end=Date.parse(p.date+'T23:00:00+09:00');if(now>=end){planner.finishGuided(end);return;}}
  const stamp=koreanDate(now)+':'+Math.floor(dayMinute(now));if(stamp===minuteStamp)return;minuteStamp=stamp;
  if(document.hidden||now-lastSignalAt<60000)return;
  let signal='',text='',owner=f?.student||getLobby();
  if(f&&planner.focus?.started){const elapsed=(planner.focus.elapsed+now-planner.focus.started)/60000,p=planner.state.plans.find(p=>p.id===planner.focus.planId);if(elapsed>=(planner.focus.guideMinutes||p.minutes)){signal=planner.focus.id+':end';text=copy(f.student).check;}else if(elapsed>=Math.min(20,(planner.focus.guideMinutes||p.minutes)/2)){signal=planner.focus.id+':middle';text=voice(f.student).middle;}}
  else if(!getSession()&&!planner.focus&&!state.activeMeal){signal=koreanDate(now)+':'+(route.before?'morning':route.after?'night':b?.kind+':'+(b?.unit?.id||b?.title));if(b?.kind==='study'&&!route.before&&!route.after){owner=b.unit.student;text=voice(owner).start+' '+b.unit.goal;}else if(route.after)text=voice(owner).end;else if(b?.kind==='meal')text=copy(owner).meal;}
  const nextMeal=route.rows.find(m=>m.kind==='meal'&&m.tentative&&m.start>dayMinute(now)&&m.start-dayMinute(now)<=10);
  if(f&&nextMeal&&!state.signals.includes(koreanDate(now)+':meal-soon:'+nextMeal.meal)){signal=koreanDate(now)+':meal-soon:'+nextMeal.meal;text=voice(owner).beforeMeal;}
  const lastMeal=state.meals.filter(m=>!m.reported&&now-m.end>=30*60000&&now-m.end<90*60000).at(-1);
  if(f&&lastMeal&&!state.signals.includes('sleepy:'+lastMeal.end)&&(!text||state.signals.includes(signal))){signal='sleepy:'+lastMeal.end;text=voice(owner).sleepy||'졸리지? 잠깐 일어나서 바람 쐬고 오자. 무리해서 읽지는 말고.';}
  if(signal&&text&&!state.signals.includes(signal)&&save({...state,signals:[...state.signals,signal]})){lastSignalAt=now;const c=card();onMessage({id:(c?.kind==='study'&&signal.includes(c.unitId))||c?.kind==='meal'?c.noticeId:signal,student:owner,text,kind:c?.kind==='study'?'invite':c?.kind==='meal'?'meal':'notice'});if(!blocked()&&!quiet()){selectStudent(owner);say({text,expression:'smile',group:'route'});}}
 }
 return {card,act,deferMeal,check,start,brief,finish,finished,tick,openDay,mealAction,get active(){return !!current();},get eating(){return !!state.activeMeal;},get guided(){return !!routeFocus(planner.state);},get state(){return state;},export:()=>state,import:raw=>raw?.version===1&&save(mergeRoute(state,raw))};
}
