import {normalizeCare,mergeCare,retireQuests,loadCare,careKey,retiredQuestKey,bondPenalty,recordOvertimePenalty,dayStart,unionDuration} from './care-engine.js?v=20261116quests2';
import {koreanDate} from './game-state.js';
import {durationText} from './statistics-engine.js?v=20261116quests2';
export function createCareUI({pauseStudy,pausePlanner,openModal,closeModal,onLine,onChange,toast}){
 let state=normalizeCare(null),failed=false,readable=true;
 try{const loaded=loadCare(localStorage);state=loaded.state;if(!loaded.persisted)toast('기록을 저장하지 못했어. 기존 기록은 보관하고 있어.');}catch{readable=false;toast('기록을 읽지 못했어. 설정에서 백업을 확인해 줘.');}
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 function persist(){if(!readable)return false;try{localStorage.setItem(careKey,JSON.stringify(state));localStorage.removeItem(retiredQuestKey);failed=false;return true;}catch{if(!failed)toast('기록을 저장하지 못했어. 백업을 확인해 줘.');failed=true;return false;}}
 function save(next){const previous=state;state=next;if(!persist()){state=previous;return false;}return true;}
 function restOpen(){
  openModal('<div class="sheetEyebrow">BREAK TIME</div><h2>쉬는시간</h2><div class="restIllustration" aria-hidden="true"><img src="./assets/scenes/cafe-noon-v1.jpg" alt=""></div><p class="restLine">잠깐 쉬자. 내 옆자리 비어 있어!</p><div id="restControls"></div><p class="restNote">휴식은 공부시간과 성장에 포함되지 않아.</p>');
  const controls=document.querySelector('#restControls');
  if(state.rest){const timer=el('time',undefined,'restTimer');timer.id='restTimer';const status=el('p',undefined,'restStatus');status.id='restStatus';const finish=el('button','휴식 끝','action solid');finish.onclick=()=>{const now=Date.now(),r=state.rest;if(!save({...state,rest:null,rests:[...state.rests,{id:r.id,start:r.started,end:now}]}))return;closeModal();onLine('좋아, 좀 살 것 같아! 준비되면 다시 시작하자.');onChange();tick();};controls.append(timer,status,finish);}
  else {const choices=el('div',undefined,'restChoices');for(const minutes of [5,10,20,30]){const b=el('button',`${minutes}분`);b.onclick=()=>{
    pauseStudy();pausePlanner();if(!save({...state,rest:{id:crypto.randomUUID(),started:Date.now(),minutes}}))return;onLine('후아— 잠깐 어깨 힘 빼자. 나도 옆에서 쉴래.');onChange();restOpen();tick();
   };choices.append(b);}controls.append(choices);}
  const today=dayStart(koreanDate()),restTime=unionDuration(state.rests,today,today+86400000);controls.append(el('p','오늘 휴식 · '+durationText(restTime),'restNote'));tick();
 }
 function tick(){
  const rest=state.rest,timer=document.querySelector('#restTimer');if(!timer||!rest)return;
  const remaining=Math.max(0,rest.minutes*60000-(Date.now()-rest.started));timer.textContent=String(Math.floor(remaining/60000)).padStart(2,'0')+':'+String(Math.floor(remaining/1000)%60).padStart(2,'0');document.querySelector('#restStatus').textContent=remaining?'잠깐 쉬어 가자.':'준비되면 휴식을 마쳐 줘.';
 }
 if(state.rest){pauseStudy();pausePlanner();}
 setInterval(tick,1000);
 return {restOpen,tick,get resting(){return !!state.rest;},get state(){return state;},penalty:id=>bondPenalty(state,id),
  recordOvertime(value){const next=recordOvertimePenalty(state,value);if(next!==state)save(next);},
  export:()=>structuredClone(state),
  import(raw,{legacy=false}={}){if(!raw||raw.version!==1||(!legacy&&!Array.isArray(raw.bondAdjustments)))return false;const ok=save(mergeCare(state,legacy?retireQuests(raw):raw));if(ok)onChange();return ok;}
 };
}
