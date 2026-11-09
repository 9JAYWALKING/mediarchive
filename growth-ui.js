import {schedule} from './schedule-data.js';
import {growthUnits,unitKey,eventFor,summarizeGrowth} from './growth-engine.js';
const mark=n=>'★'.repeat(n)+'☆'.repeat(3-n);
export function createGrowthUI({getState,getGrowth,openModal,closeModal,onCommit,onReview=()=>{},onContinue,onLaunch,format}){
 const $=s=>document.querySelector(s);
 function progress(){
  const g=getGrowth(),target=g.cycles>=5?'완성':g.cycles<3?`학생 ${g.stars+1}성`:`악세사리 ${g.accessory+1}성`;
  openModal('<h2>하루</h2><div class="growthHero"><strong id="growthLevel"></strong><span id="growthStars"></span></div><progress id="growthLevelBar" max="1" aria-label="레벨 진행도"></progress><div class="growthTarget"><b id="growthTarget"></b><span id="growthCount"></span></div><div id="growthUnits" class="growthUnitList"></div><details class="growthRules"><summary>성장 규칙</summary><p>강의별 Wiki·J·JBL을 완료하면 성급이 오릅니다. 3성부터 악세사리를 키울 수 있습니다.</p><p>새로운 내용은 완료 속도에 따라 작은 추가 보상을 받습니다. 오래 걸려도 감점하지 않으며, 익숙한 내용에는 속도 보상을 붙이지 않습니다.</p><p>강의 시작 전 진행한 시간은 성장 보상 ×1.5. 범위 표시는 질문에만 적용되며, 성급은 이벤트의 완료 기록으로 올라갑니다.</p></details>');
  $('#growthLevel').textContent=`Lv. ${g.level}`;$('#growthStars').textContent=mark(g.stars);$('#growthLevelBar').value=g.progress;
  $('#growthTarget').textContent=target;$('#growthCount').textContent=g.cycles>=5?'9 / 9':`${g.done.length} / 9`;
  for(const lecture of [1,2,6]){
   const row=document.createElement('section'),title=document.createElement('h3'),buttons=document.createElement('div');title.textContent=schedule.find(l=>l.id===lecture).title;
   for(const unit of growthUnits.filter(u=>u.lecture===lecture)){const b=document.createElement('button'),done=g.done.includes(unit.id);b.textContent=unit.track+(done?' ✓':'');b.className=done?'done':'';b.setAttribute('aria-label',`${title.textContent} ${unit.track}${done?' 완료':''}`);b.onclick=()=>{closeModal();onLaunch(lecture,unit.track);};buttons.append(b);}row.append(title,buttons);$('#growthUnits').append(row);
  }
 }
 function finish(){
  const session=getState().session;if(!session)return;
  const at=Date.now(),g=getGrowth(),unit=unitKey(session.context),initial=eventFor(session,{now:at}),already=unit&&g.coverage[(session.cycle||1)-1].includes(unit);
  const canComplete=!!unit&&!!initial&&initial.duration>=60000&&!already&&g.cycles<5;
  openModal('<h2>종료</h2><div class="finishSummary"><b id="finishContext"></b><time id="finishTime"></time></div><label class="completionCheck"><input id="unitComplete" type="checkbox"><span>범위 완료</span><small id="finishHint"></small></label><div class="finishReward"><span>성장</span><strong id="finishXP"></strong></div><p id="finishError" role="status"></p><div class="finishButtons"><button id="finishContinue">계속</button><button id="finishSave">저장</button></div>');
  $('#finishContext').textContent=unit?`${schedule.find(l=>l.id===session.context.lecture).title} · ${session.context.track}`:'하루 · 자유';
  $('#finishTime').textContent=format(initial?.duration||session.elapsed);$('#unitComplete').disabled=!canComplete;
  $('#finishHint').textContent=!unit?'시간만 기록해요.':g.cycles>=5?'성급·악세사리 완성':already?'이미 완료한 범위예요.':!canComplete?'1분부터 완료할 수 있어요.':'선택한 자료의 전체 범위';
  function estimate(){const e=eventFor(session,{now:at,complete:$('#unitComplete').checked});const after=e?summarizeGrowth({events:[...getState().growth.events,e]}):g;$('#finishXP').textContent='+'+Math.max(0,after.xp-g.xp);}
  $('#unitComplete').onchange=estimate;estimate();let saving=false;
  $('#finishContinue').onclick=()=>{closeModal();onContinue();};
  $('#finishSave').onclick=()=>{
   if(saving)return;saving=true;const e=eventFor(session,{now:at,complete:canComplete&&$('#unitComplete').checked});
   const result=onCommit(e);if(!result.ok){saving=false;$('#finishError').textContent='저장하지 못했어요. 다시 시도해 주세요.';return;}
   resultScreen(result.before,result.after,e);if(result.reviewId)onReview(result.reviewId);
  };
 }
 function resultScreen(before,after,event){
  const reward=event?after.rewards[event.id]:null;
  const changed=after.cycles>before.cycles;
  openModal('<div class="sheetEyebrow">하루</div><h2 id="resultTitle"></h2><div class="growthHero"><strong id="resultLevel"></strong><span id="resultStars"></span></div><progress id="resultBar" max="1" aria-label="레벨 진행도"></progress><div class="earnedXP" id="resultXP"></div><p class="resultLine" id="resultLine"></p><div class="rewardTags" id="rewardTags"></div><details><summary>상세</summary><p id="rewardBreakdown"></p></details><button class="action solid" id="resultClose">닫기</button>');
  $('#resultTitle').textContent=changed?(after.cycles<=3?'성급 상승':'악세사리 강화'):after.level>before.level?'레벨 상승':'결과';
  $('#modal').setAttribute('aria-label',$('#resultTitle').textContent);
  $('#resultLevel').textContent=`Lv. ${after.level}`;$('#resultStars').textContent=mark(after.stars);$('#resultBar').value=after.progress;$('#resultXP').textContent='성장 +'+Math.max(0,after.xp-before.xp);
  $('#resultLine').textContent=after.cycles===3&&changed?'이 머리핀, 이제 너한테 자랑해도 되겠다!':changed?'봤지? 우리, 또 해냈어!':after.level>before.level?'헤헤, 나 좀 더 든든해졌지?':'수고했어! 다음에도 내 옆자리야.';
  const tags=[];if(after.unlocked)tags.push('하트 머리핀 '+('★'.repeat(after.accessory)+'☆'.repeat(2-after.accessory)));if(reward?.preview>0)tags.push('예습 ×1.5');if(reward?.accepted)tags.push('범위 완료');
  for(const text of tags){const span=document.createElement('span');span.textContent=text;$('#rewardTags').append(span);}
  $('#rewardBreakdown').textContent=reward?`시간 ${reward.base.toFixed(1)} · 예습 ${reward.preview.toFixed(1)} · 완료 ${reward.completion.toFixed(1)} · 몰입 ${reward.focus.toFixed(1)} XP`:'기록된 시간 없음';
  $('#resultClose').onclick=closeModal;
 }
 return {finish,progress};
}

