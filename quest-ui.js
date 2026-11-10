import {normalizeQuests,mergeQuests,captureRun,checkAttendance,dailyQuests,weeklyQuests,weekStart,unionDuration,dayStart,dailyQuestPolicy,recordArrival,arrivalPenalty,takeLateArrival} from './quest-engine.js?v=20261110';
import {koreanDate,shiftDate} from './game-state.js';
import {durationText} from './statistics-engine.js?v=20261110';
const KEY='heart-companion-quests-v1';
export function createQuestUI({getStudy,getPlanner,pauseStudy,pausePlanner,openModal,closeModal,onPlan,onLine,onChange,toast}){
 let state;try{state=normalizeQuests(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{state=normalizeQuests(null);}
 let tab='daily',date=koreanDate(),followToday=true,host=null,lastPaint='',lastPersist=0,failed=false,lastBadgeAt=0;
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));failed=false;return true;}catch{if(!failed)toast('퀘스트 기록을 저장하지 못했어. 백업을 확인해 줘.');failed=true;return false;}}
 function capture(now=Date.now(),force=false){
  const before=state,p=getPlanner();state=captureRun(state,getStudy().session,'haru',now);state=captureRun(state,p.focus,p.focus?.student,now);
  if(!document.hidden){state=recordArrival(state,p.settings.students.map(s=>s.id),now);state=checkAttendance(state,now);}
  if(((force||now-lastPersist>=5000)&&state!==before)||force){persist();lastPersist=now;}
 }
 function restOpen(){
  capture(Date.now(),true);
  openModal('<div class="sheetEyebrow">BREAK TIME</div><h2>쉬는시간</h2><div class="restIllustration" aria-hidden="true"><img src="./assets/scenes/cafe-noon-v1.jpg" alt=""></div><p class="restLine">잠깐 쉬자. 내 옆자리 비어 있어!</p><div id="restControls"></div><p class="questNote">휴식은 공부시간과 성장에 포함되지 않아.</p>');
  const controls=document.querySelector('#restControls');
  if(state.rest){const timer=el('time',undefined,'restTimer');timer.id='restTimer';const status=el('p',undefined,'restStatus');status.id='restStatus';const finish=el('button','휴식 끝','action solid');finish.onclick=()=>{const now=Date.now(),r=state.rest;state={...state,rest:null,rests:[...state.rests,{id:r.id,start:r.started,end:now}]};persist();closeModal();onLine('좋아, 좀 살 것 같아! 준비되면 다시 시작하자.');onChange();tick();};controls.append(timer,status,finish);}
  else {const choices=el('div',undefined,'restChoices');for(const minutes of [5,10,20,30]){const b=el('button',`${minutes}분`);b.onclick=()=>{
    capture(Date.now(),true);pauseStudy();pausePlanner();state={...state,rest:{id:crypto.randomUUID(),started:Date.now(),minutes}};persist();onLine('후아— 잠깐 어깨 힘 빼자. 나도 옆에서 쉴래.');onChange();restOpen();tick();
   };choices.append(b);}controls.append(choices);}
  const today=dayStart(koreanDate()),restTime=unionDuration(state.rests,today,today+86400000);controls.append(el('p','오늘 휴식 · '+durationText(restTime),'questNote'));tick();
 }
 function render(container){
  host=container;capture(Date.now(),true);host.replaceChildren();lastPaint='';
  const tabs=el('div',undefined,'questTabs');for(const [id,label] of [['daily','일일'],['weekly','주간']]){const b=el('button',label);b.setAttribute('aria-pressed',String(tab===id));b.onclick=()=>{tab=id;render(host);};tabs.append(b);}host.append(tabs);
  const nav=el('div',undefined,'questDate'),prev=el('button','‹'),next=el('button','›'),middle=el('button',tab==='daily'?date.replaceAll('-','.'):`${weekStart(date).slice(5).replace('-','.')} — ${shiftDate(weekStart(date),6).slice(5).replace('-','.')}`);prev.setAttribute('aria-label','이전 '+(tab==='daily'?'날':'주'));next.setAttribute('aria-label','다음 '+(tab==='daily'?'날':'주'));middle.setAttribute('aria-label','오늘 퀘스트');prev.onclick=()=>{followToday=false;date=shiftDate(date,tab==='daily'?-1:-7);render(host);};next.onclick=()=>{followToday=false;date=shiftDate(date,tab==='daily'?1:7);render(host);};middle.onclick=()=>{followToday=true;date=koreanDate();render(host);};nav.append(prev,middle,next);host.append(nav);
  const summary=el('section',undefined,'questSummary');summary.id='questSummary';host.append(summary);
  const list=el('div',undefined,'questList');list.id='questList';host.append(list);
  if(tab==='daily'){
   for(const q of dailyQuests(state,date)){const card=el('article',undefined,'questDaily');card.dataset.quest=q.id;const top=el('div'),number=el('span',q.id==='attendance'?'01':q.id==='morning'?'02':q.id==='afternoon'?'03':'04','questNumber'),name=el('div');name.append(el('h3',q.title),el('small',q.label));const stamp=el('b',undefined,'questStamp');stamp.dataset.status=q.id;top.append(number,name,stamp);card.append(top);const meter=el('progress');meter.max=q.target;meter.setAttribute('aria-label',q.title+' 진행도');card.append(meter);const value=el('p',undefined,'questValue');value.dataset.value=q.id;card.append(value);list.append(card);}
   const note=el('details',undefined,'questRules');note.append(el('summary','집계 기준'),el('p',dailyQuestPolicy(date).freeDay?'수업 없는 날 · 08시 전 출석. 오전 00–13시 4시간, 오후 13–19시 4시간, 저녁 19–24시 3시간.':'수업 있는 날 · 07시 전 출석. 오전 00–14시 3시간, 오후 14–19시 2시간, 저녁 19–24시 3시간. 오후 수업 외 시간이 2시간 미만이면 오후 퀘스트는 쉬어 가.'),el('p','휴식·일시정지·개인 일정은 제외해. 시간대 퀘스트는 기능 추가 후 실행한 타이머부터 집계하며, 지난 기록의 시작 시각은 추정하지 않아.'));host.append(note);
  }else{
   const week=weeklyQuests(getStudy(),getPlanner(),date);for(const l of week.lectures){const card=el('article',undefined,'questLecture'),heading=el('div',undefined,'questLectureHeading');heading.append(el('small',`${l.date.slice(5).replace('-','.')} · ${l.id}강${l.student?' · '+l.student.name:''}`),el('h3',l.title));card.append(heading);const units=el('div',undefined,'questUnits');for(const u of l.units){const b=el('button');b.dataset.complete=String(u.complete);b.setAttribute('aria-label',`${l.id}강 ${u.track} · ${u.status}`);b.append(el('b',u.track),el('small',u.status));b.disabled=!u.available||!l.student||u.complete;b.onclick=()=>onPlan({student:l.student.id,lecture:l.id,track:u.track,title:l.title+' · '+u.track});units.append(b);}card.append(units);list.append(card);}if(!week.lectures.length)list.append(el('p','이번 주에는 수업이 없어.','questEmpty'));
   host.append(el('p','수업 후 · 해당 주 안에 저장한 범위 완료 기록으로 채워져.','questNote'));
  }
  tick();
 }
 function tick(){
  const now=Date.now();capture(now);
  if(now-lastBadgeAt>=15000){const items=dailyQuests(state,koreanDate(now),now),badge=document.querySelector('#questProgress');if(badge)badge.textContent=items.filter(q=>q.complete).length+'/'+items.length;lastBadgeAt=now;}
  const rest=state.rest,button=document.querySelector('#quickRest');if(button){button.textContent=rest?'휴식 중':'쉬는시간';button.classList.toggle('is-resting',!!rest);}
  const timer=document.querySelector('#restTimer');if(timer&&rest){const remaining=Math.max(0,rest.minutes*60000-(now-rest.started));timer.textContent=String(Math.floor(remaining/60000)).padStart(2,'0')+':'+String(Math.floor(remaining/1000)%60).padStart(2,'0');document.querySelector('#restStatus').textContent=remaining?'잠깐 쉬어 가자.':'준비되면 휴식을 마쳐 줘.';}
  if(!host?.isConnected||!host.querySelector('#questSummary'))return;
  if(followToday&&date!==koreanDate(now)){date=koreanDate(now);render(host);return;}
  if(tab==='daily'){
   const items=dailyQuests(state,date,now);for(const q of items){const card=host.querySelector(`[data-quest="${q.id}"]`);if(!card)continue;card.dataset.complete=String(q.complete);card.querySelector('progress').value=Math.min(q.value,q.target);card.querySelector('[data-status]').textContent=q.status;card.querySelector('[data-value]').textContent=q.id==='attendance'?(q.complete?new Date(state.attendance[date]).toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit'})+' 출석':q.label+' 접속'):durationText(Math.min(q.value,q.target))+' / '+(q.target/3600000)+'시간';}
   host.querySelector('#questSummary').textContent=`${items.filter(q=>q.complete).length} / ${items.length} 완료`;
  }else{
   const week=weeklyQuests(getStudy(),getPlanner(),date,now),units=week.lectures.flatMap(l=>l.units).filter(u=>u.available);host.querySelector('#questSummary').textContent=`${units.filter(u=>u.complete).length} / ${units.length} 완료`;
   const signature=week.lectures.flatMap(l=>l.units.map(u=>u.status)).join('|');if(lastPaint&&signature!==lastPaint){render(host);return;}lastPaint=signature;
  }
 }
 // A rest survives reload; the study timers remain paused until explicitly resumed.
 if(state.rest){pauseStudy();pausePlanner();}
 capture(Date.now(),true);setInterval(tick,1000);
 window.addEventListener('pagehide',()=>capture(Date.now(),true));document.addEventListener('visibilitychange',()=>capture(Date.now(),true));
 return {render,restOpen,capture,tick,penalty:id=>arrivalPenalty(state,id),takeArrival(){const next=takeLateArrival(state);if(!next.event)return null;const previous=state;state=next.state;if(!persist()){state=previous;return null;}return next.event;},get resting(){return !!state.rest;},get state(){return state;},export(){capture(Date.now(),true);return structuredClone(state);},import(raw){if(!raw||raw.version!==1||!Array.isArray(raw.runs)||!raw.attendance)return false;state=mergeQuests(state,raw);const ok=persist();onChange();return ok;},resetDate(){followToday=true;date=koreanDate();}};
}
