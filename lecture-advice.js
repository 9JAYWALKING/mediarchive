import {lectureAdvice} from './lecture-advice-data.js';
import {schedule} from './schedule-data.js';
import {defaultStudents} from './planner-catalog.js';
import {illustratedStudents} from './character-data.js?v=20261110ritsu';
import {splitDialogue} from './dialogue-pages.js';

export function adviceFor(context={}){
 const lesson=schedule.find(l=>l.id===Number(context.lecture));
 const entry=lesson&&lectureAdvice[lesson.id];
 if(!entry)return null;
 const owner=defaultStudents.find(s=>s.lectures.includes(lesson.id));
 const student=context.student&&typeof context.student==='object'?context.student:defaultStudents.find(s=>s.id===context.student)||owner;
 const track=['Wiki','J','JBL'].includes(context.track)?context.track:'자유';
 return {lesson,student,track,lead:entry.lead,tip:entry.tracks[track]||'',portrait:illustratedStudents.find(s=>s.id===student?.id)?.portrait};
}
export function advicePages(entry){return [...splitDialogue(entry.lead).map(text=>({text,kind:'lead'})),...splitDialogue(entry.tip).map(text=>({text,kind:'tip'}))];}

export function createLectureAdvice({openModal,closeModal,onLine}){
 function open(context,onStart){
  const entry=adviceFor(context);if(!entry)return false;
  openModal('<div class="lectureAdvice"><div class="adviceSpeaker"><div id="adviceAvatar"></div><div><b id="adviceName"></b><small id="adviceContext"></small></div></div><h2 id="adviceTitle"></h2><p id="adviceLead" aria-live="polite"></p><div class="advicePageNav"><button id="advicePrevious" aria-label="이전 대사">‹</button><span id="advicePageDots" role="status"></span></div><button class="action solid" id="adviceStart">다음</button></div>');
  const $=s=>document.querySelector(s),avatar=$('#adviceAvatar');
  if(entry.portrait){const img=document.createElement('img');img.src=entry.portrait;img.alt='';avatar.append(img);}else avatar.textContent=entry.student.name.slice(0,1);
  $('#adviceName').textContent=entry.student.name;
  $('#adviceContext').textContent=`${entry.lesson.id}강 · ${entry.track}`;
  $('#adviceTitle').textContent=entry.lesson.title;
  $('#modal').setAttribute('aria-label',`${entry.student.name} · 시작 전`);
  const pages=advicePages(entry);let page=0,committed=false;
  function render(){
   $('#adviceLead').textContent=pages[page].text;
   $('#adviceLead').dataset.kind=pages[page].kind;
   $('#advicePrevious').disabled=page===0;
   $('#advicePageDots').textContent=pages.map((_,i)=>i===page?'●':'○').join(' ');
   $('#advicePageDots').setAttribute('aria-label',`대사 ${page+1}/${pages.length}`);
   $('#adviceStart').textContent=page===pages.length-1?'시작':'다음';
  }
  $('#advicePrevious').onclick=()=>{if(page>0){page--;render();}};
  $('#adviceStart').onclick=()=>{if(committed)return;if(page<pages.length-1){page++;render();return;}committed=true;closeModal();onStart();if(entry.student.id==='haru')onLine?.({text:pages.at(-1).text,group:'advice'});};
  render();
  return true;
 }
 return {open};
}
