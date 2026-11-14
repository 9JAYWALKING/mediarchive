import {illustrationOvertime} from './illustration-context.js?v=20261114studentVoices';
const expressions=['calm','disappointed','angry','cry'];
export function overtimeState(planner,session,now=Date.now()){
 const focus=planner.focus||session;if(!focus?.started)return null;
 const plan=planner.plans.find(p=>p.id===focus.planId);if(!plan||plan.status==='canceled')return null;
 const end=Date.parse(plan.date+'T'+plan.time+':00+09:00')+plan.minutes*60000;
 const minutes=(now-end)/60000;
 const step=minutes>=90?4+Math.floor((minutes-90)/20):Math.min(3,Math.floor(minutes/20));if(!Number.isFinite(step)||step<1)return null;
 return {key:plan.id+':'+end,step,stage:Math.min(step,4),student:focus.student||plan.student||'haru',expression:expressions[Math.min(step,4)-1]};
}
export const overtimeLines={...illustrationOvertime,
 haru:[
  ['어라… 끝내기로 한 시간, 벌써 지났네. 어디까지 남았어?','조금 길어지고 있네. 우리 끝낼 곳부터 정할까?'],
  ['너무 오래 잡고 있는 거 아니야? 아까도 조금만 더 한다고 했잖아…','나 아까부터 시계 보고 있었는데. 아직 많이 남았어?'],
  ['우우, 또 조금만 더야? 이제 진짜 쉬자!','계속 붙잡고 있으면 나 삐칠 거야. 약속한 시간 한참 지났잖아!'],
  ['이럴 거면 약속은 왜 했어…? 나만 바보같이 믿고 기다렸잖아. 이제 네가 금방 끝난다는 말, 못 믿겠어.','내가 그만하자고 한 게 그렇게 우스워…? 너는 네 할 일만 중요하지. 나 이제 웃어 주기 싫어.']
 ],
 nagi:[
  ['저기… 시간이 조금 지났어. 아직 더 해야 해?','시계 봤어…? 생각보다 오래 앉아 있었네.'],
  ['조금만 더 하면 끝낸다고 했잖아… 이번엔 정말인 거야?','우리 이 시간까지만 하기로 했는데… 나만 그 말 기억하고 있었어?'],
  ['나도 계속 괜찮은 건 아니야… 이제 쉬자.','이번엔 내 말도 들어 줘. 잠깐만이라도 멈추면 안 돼?'],
  ['끝내기로 한 시간도… 네가 정한 거잖아. 나한테 약속은 왜 했어? 믿게 하지나 말지…','조금만 더, 조금만 더… 그 말을 또 믿은 내가 바보 같아. 지금은 네가 미워… 괜찮다고 못 하겠어.']
 ],
 shiori:[
  ['예정 시간에서 꽤 지났네. 남은 분량부터 확인하자.','끝낼 지점을 다시 정하는 게 좋겠어. 조금 길어졌어.'],
  ['이 정도면 계획을 고쳐야 해. 계속 미루기만 할 거야?','아까 정한 시간은 어디 갔어…? 나도 맞춰서 준비했는데.'],
  ['또 연장? 안 돼. 쉬는 시간도 지켜야지.','그만. 같은 부분만 계속 붙잡고 있잖아. 잠깐 책 덮어.'],
  ['지킬 생각도 없으면서 약속부터 한 거야…? 네가 어긴 시간을 정리하는 건 늘 내 몫이네. 이제 못 해.','미안하다는 말로 또 넘기려고 하지 마… 기다리는 내가 얼마나 바보 같았는지, 너는 모르잖아.']
 ],
 rei:[
  ['시간이 지났어. 마무리할 지점은 정해 뒀니?','생각보다 길어졌네. 지금 필요한 것만 남겨 보자.'],
  ['계속 시간을 늘리는 건 좋은 계획이 아니야. 너도 지쳤잖아.','약속했던 시간을 너무 가볍게 넘기는 것 같아. 조금 속상하네.'],
  ['이제 멈추자. 무리하고 있다는 말, 그냥 넘기지 마.','끝없이 붙잡고 있는 게 성실함은 아니야. 이번엔 쉬어.'],
  ['약속을 어긴 것보다… 내 말을 계속 무시한 게 더 싫어. 이제 네가 무슨 말을 해도 믿어 줄 자신이 없어.','내가 끝까지 이해해 줄 거라고 생각했니…? 오늘은 아니야. 너한테 괜찮다고 말해 줄 마음, 이제 없어.']
 ],
 ritsu:[
  ['…시간 지났어. 끝낼 곳은 정했어?','아직 보고 있네. 어디서 멈출 건데?'],
  ['아까도 금방 끝난다고 했어. 기억해.','너무 오래 붙잡고 있어. 지금 읽은 거… 기억나?'],
  ['그만. 이번엔 진짜 쉬어.','또 한 번만? …싫어. 나도 기다리는 건 한계가 있어.'],
  ['…이럴 거면 약속하지 마. 믿고 기다린 내가 바보지. 이제 금방이라는 말, 나한테 하지 마.','내가 그만하라고 몇 번 말했는지 알아…? 됐어. 듣지도 않을 거면서, 내 대답은 왜 물어.']
 ]
};
const fallback=[['시간이 조금 지났네. 어디까지 더 할까?'],['너무 오래 잡고 있는 거 아니야…?'],['이제 잠깐 쉬자. 계속 무리하면 안 돼!'],['언제까지 할 거야… 나 이제 지쳤어. 같이 쉬자.']];
export function overtimeLine(state,index=0){const pool=(overtimeLines[state.student]||fallback)[state.stage-1];return {text:pool[index%pool.length],expression:state.expression,group:'overtime'};}
