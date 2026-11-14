import {classTime} from './class-time.js';
import {illustrationClass} from './illustration-messages.js?v=20261114studentVoices';
import {illustratedStudents} from './character-data.js?v=20261114senaBlack6';

export const classReplies={
 ...illustrationClass,
 ritsu:{ask:['수업 중이지? 지금은 내 쪽 말고 앞을 봐. 끝나면 기다릴게.','아직 종 안 쳤는데. 수업 얘기부터 듣고 와.'],okay:'응. 헷갈린 데만 표시해 둬. 끝나고 같이 보자.',early:'일찍 끝났네. 그럼 잠깐 쉬고 같이 시작할까.'},
 haru:{ask:['음~ 지금 수업 중 아니야? 나 말고 앞에 봐, 우우!','앗, 수업 시간이잖아! 수업에 집중해! 나는 기다릴게.'],okay:'응! 끝나면 와. 네 자리 맡아 둘게!',early:'헉, 벌써 끝났어? 좋아! 그럼 지금부터 나랑 하자.'},
 nagi:{ask:['지금… 수업 중 아니야? 놓치면 아쉬우니까, 나는 조금 기다릴게.','수업 듣고 있으면 앞에 봐도 돼. 끝나면 불러 줘…?'],okay:'응, 다녀와. 끝나고 천천히 얘기해 줘.',early:'일찍 끝났구나… 그럼 조금 더 같이 있을 수 있겠다.'},
 shiori:{ask:['시간표에는 아직 수업인데. 혹시 나 보느라 놓치고 있는 건 아니지?','지금은 수업 시간. 나랑 할 건 끝나고 이어 가자.'],okay:'좋아. 헷갈리는 데만 표시해 둬. 나중에 같이 보자.',early:'벌써 끝났어? 좋아, 빈 시간에 뭘 할지 골라 보자.'},
 rei:{ask:['지금은 수업에 집중할 시간이지? 나는 끝나고 만나도 괜찮아.','음, 아직 수업 시간인 것 같은데. 앞을 봐 줘, 선생님.'],okay:'응. 다녀와. 돌아오면 같이 정리하자.',early:'일찍 끝났구나. 그럼 남은 시간은 우리 계획대로 써 볼까?'}
};

export function createClassCheckin({openModal,closeModal,onLine,onPause,onReady,isBlocked,getStudent=()=> 'haru'}){
 let showing=false,attempted='';
 function ask(continuation,student='haru'){
  const lesson=classTime.current();if(!lesson||classTime.released())return true;
  const actor=illustratedStudents.find(s=>s.id===student)||illustratedStudents[0],voice=classReplies[actor.id]||classReplies.haru;
  attempted=lesson.key;showing=true;onPause();
  const line=voice.ask[Math.floor(Math.random()*voice.ask.length)];onLine({text:line,expression:['haru','shiori','momo','akari','ibuki'].includes(actor.id)?'angry':'calm'});
  openModal('<div class="classCheckin"><img class="classCheckinPortrait" alt=""><div class="sheetEyebrow" id="classSpeaker"></div><h2>잠깐!</h2><p id="classCheckinLine"></p><small id="classCheckinLesson"></small><div class="classReplyButtons"><button class="action" id="classAttend">응, 알겠어</button><button class="action solid" id="classEarly">수업 일찍 끝났어</button></div></div>');
  document.querySelector('.classCheckinPortrait').src=actor.portrait;
  document.querySelector('#classSpeaker').textContent=actor.name;
  document.querySelector('#classCheckinLine').textContent=line;
  document.querySelector('#classCheckinLesson').textContent=`${lesson.time} · ${lesson.title}`;
  const finish=early=>{
   const current=classTime.current();
   showing=false;closeModal();
   // A reply left open across the bell must never release the next lecture.
   if(current?.key!==lesson.key){if(early){if(!ask(continuation,student))return;(continuation||onReady)();}return;}
   classTime.answer(lesson,early);
   if(early)(continuation||onReady)();
   onLine({text:early?voice.early:voice.okay,expression:early&&actor.id==='haru'?'happy':'smile'});
  };
  document.querySelector('#classAttend').onclick=()=>finish(false);
  document.querySelector('#classEarly').onclick=()=>finish(true);
  document.querySelector('#modal').addEventListener('close',()=>{showing=false;},{once:true});
  return false;
 }
 return {allow:ask,check(){const lesson=classTime.current();if(!lesson||classTime.answered()||lesson.key===attempted||showing||isBlocked())return false;ask(undefined,getStudent());return true;}};
}
