import {lessons,topics,questions,reactions} from './quiz-data.js';
import {normalizeQuiz,bondScore,setProgress,invite,postpone,tick,answer,mergeQuiz} from './quiz-engine.js';
const KEY='heart-companion-v1-quiz',MINUTE=60000;
export function createQuizUI({getMemories,onExpression=()=>{},onLine,onBondChange,openModal,closeModal,toast}){
 let state,preview=false,last=performance.now(),savedAt=0;
 try{state=normalizeQuiz(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{state=normalizeQuiz(null);}
 const button=document.querySelector('#questionInvite');
 const pick=kind=>reactions[kind][Math.floor(Math.random()*reactions[kind].length)];
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{toast('질문 기록 저장 실패. 설정에서 내보내세요.');return false;}}
 function score(){return bondScore(getMemories(),state);}
 function update(){button.hidden=!state.pending;onBondChange(score());}
 function line(kind){onLine(pick(kind));}
 function dismiss(){if(!preview){postpone(state);save();update();line('later');}closeModal();}
 function showQuestion(isPreview=false){
  preview=isPreview;
  const pending=state.pending;
  const q=isPreview?questions[8]:questions.find(x=>x.id===pending?.qid);
  if(!q)return;
  openModal('<div class="quizHead"><span class="pill">하루</span><small id="quizMode"></small></div><h2 id="quizTitle">질문</h2><p class="quizPrompt" id="quizPrompt"></p><div id="quizChoices" class="quizChoices"></div><div id="quizResult" role="status" hidden></div><button id="quizLater" class="action">나중에</button>');
  const $=s=>document.querySelector(s);
  $('#quizMode').textContent=isPreview?'미리보기 · 점수 반영 없음':'';
  $('#quizPrompt').textContent=q.text;
  let answered=false;
  q.choices.forEach((choice,index)=>{
   const b=document.createElement('button');b.type='button';b.textContent=choice;b.className='quizChoice';
   b.onclick=()=>{
    if(answered)return;
    const result=isPreview?{correct:index===q.answer,delta:0,recovered:false}:answer(state,pending.id,index,Date.now(),score());
    if(!result)return;answered=true;
    if(!isPreview){save();update();}
    for(const [i,el] of [...$('#quizChoices').children].entries()){el.disabled=true;if(i===q.answer)el.classList.add('correct');else if(i===index)el.classList.add('wrong');}
    const reaction=pick(result.correct?(result.recovered?'recover':'correct'):'wrong');
    onLine(reaction);onExpression(result.correct?'happy':'angry');
    $('#quizResult').hidden=false;
    const feedback=document.createElement('p');feedback.className='quizReaction';feedback.textContent=reaction;
    const change=document.createElement('b');change.className='quizDelta';change.textContent=isPreview?'미리보기':result.delta?'인연 '+(result.delta>0?'+':'')+result.delta:'인연 변동 없음';
    const detail=document.createElement('details'),summary=document.createElement('summary'),explanation=document.createElement('p'),source=document.createElement('small');
    summary.textContent='해설';explanation.textContent=q.explanation;
    const topic=topics.find(t=>t.id===q.topic);source.textContent=`${topic.lesson}강 Wiki · ${q.section} · 재구성`;
    detail.append(summary,explanation,source);$('#quizResult').append(feedback,change,detail);
    $('#quizLater').textContent='닫기';$('#quizLater').onclick=closeModal;
   };
   $('#quizChoices').append(b);
  });
  $('#quizLater').onclick=dismiss;
 }
 button.onclick=()=>showQuestion();
 function openProgress(){
  openModal('<h2>범위</h2><p>이미 본 범위만 표시해 주세요.</p><div id="quizProgress"></div><details class="quizRules"><summary>질문 규칙</summary><p>표시 후 10분부터, 시간표상 강의가 끝난 범위에서 질문합니다. 강의 시작 전에 표시한 범위는 예습으로 인정합니다.</p><p>화면이 켜진 진행 시간 18~28분마다 등장합니다. 무응답·나중에는 감점하지 않습니다.</p><p>오답 −3 · 하루 최대 −9. 같은 날 같은 질문은 한 번만 차감하며, 다음에 맞히면 마지막 차감분을 돌려줍니다. 정답 +2는 하루 5회까지입니다.</p><p>Wiki·J·JBL은 이 범위를 해당 단계까지 봤다는 표시입니다. 사이트 진도와 자동 동기화하지 않습니다.</p></details>');
  const container=document.querySelector('#quizProgress');
  for(const lesson of lessons){
   const block=document.createElement('fieldset'),title=document.createElement('legend'),date=document.createElement('small');
   title.textContent=lesson.name;date.textContent=new Date(lesson.start).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});block.append(title,date);
   for(const topic of topics.filter(t=>t.lesson===lesson.id)){
    const label=document.createElement('label'),name=document.createElement('span'),select=document.createElement('select');name.textContent=topic.name;select.setAttribute('aria-label',topic.name+' 범위');
    ['아직','Wiki','J','JBL'].forEach((text,i)=>{const option=document.createElement('option');option.value=i;option.textContent=text;select.append(option);});
    select.value=state.progress[topic.id]?.stage||0;
    select.onchange=()=>{setProgress(state,topic.id,Number(select.value),Date.now());save();update();};label.append(name,select);block.append(label);
   }container.append(block);
  }
 }
 update();
 return {
  confirmLesson(lesson,stage,at){for(const topic of topics.filter(t=>t.lesson===lesson)){if((state.progress[topic.id]?.stage||0)<stage)setProgress(state,topic.id,stage,at);}const ok=save();update();return ok;},
  openProgress,openQuestion:()=>showQuestion(),get pending(){return !!state.pending;},get score(){return score();},
  tick(flags){const now=performance.now(),dt=now-last;last=now;
   if(tick(state,dt,flags)){const q=invite(state,Date.now());if(q){save();update();line('invite');}else state.remaining=MINUTE;}
   if(now-savedAt>10000&&flags.active&&flags.visible){save();savedAt=now;}
  },
  export:()=>structuredClone(state),
  import(raw){state=mergeQuiz(state,raw);const ok=save();update();return ok;},
  save,refresh:update
 };
}
