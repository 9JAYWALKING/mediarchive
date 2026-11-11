// One visible question/answer session; checkpoints overwrite, never add twice.
export function createRecallClock({commit,now=Date.now,uuid=()=>crypto.randomUUID()}){
 let active=null;
 function flush(){if(!active)return;const end=now(),duration=Math.max(0,end-active.started);if(duration>=1000)commit({...active,at:end,duration});}
 return {start(question){if(active?.student===question.student&&active?.lecture===question.lecture)return;this.stop();active={id:'walk:'+uuid(),started:now(),student:question.student,lecture:question.lecture,title:'산책 · '+question.lectureTitle};},flush,stop(){flush();active=null;}};
}
