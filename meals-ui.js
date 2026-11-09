import {mealNames,mealDay,mealsForDate,mealErrors,mealConflicts,normalizeMeals} from './meals-engine.js';
import {schedule} from './schedule-data.js';
import {koreanDate,shiftDate} from './game-state.js';
export function createMealEditor({getState,save,onChange,openModal,closeModal,toast}){
 return function edit(date=koreanDate()){
  const state=getState(),meals=normalizeMeals(state.meals),$=s=>document.querySelector(s);let scope='day';
  openModal('<div class="sheetEyebrow" id="mealDate"></div><h2>식사시간</h2><form id="mealForm" class="mealForm"><label for="mealScope">적용</label><select id="mealScope"><option value="day">선택한 날</option><option value="daily">매일 기본</option></select><div id="mealRows"></div><label class="plannerCheck"><input id="mealOverlap" type="checkbox">겹치는 시간 허용</label><p id="mealError" role="status"></p><button type="button" id="mealReset" class="action">기본 시간 사용</button><button type="submit" class="action solid">저장</button><details class="mealGuide"><summary>대사 타이밍</summary><p>10분 전 · 종료 5분 전 · 식후 90분</p><p>식후에는 최대 두 번, 수업·취침·휴식 중에는 조용히 기다려. 식사 여부를 자동으로 확인하거나 공부 타이머를 멈추지는 않아.</p><p>선택한 날의 설정이 매일 기본보다 우선해.</p></details></form>');
  $('#mealDate').textContent=date.replaceAll('-','.');
  function paint(){const entries=scope==='day'?mealDay(meals,date).entries:meals.defaults.entries,rows=$('#mealRows');rows.replaceChildren();for(const e of entries){const row=document.createElement('section');row.className='mealEditRow';const name=document.createElement('label'),enabled=document.createElement('input');enabled.type='checkbox';enabled.checked=e.enabled;enabled.id='mealEnabled-'+e.id;name.append(enabled,document.createTextNode(mealNames[e.id]));row.append(name);const pair=document.createElement('div');pair.className='mealTimePair';for(const key of ['start','end']){const label=document.createElement('label');label.textContent=key==='start'?'시작':'종료';const input=document.createElement('input');input.type='time';input.value=e[key];input.id=`meal-${e.id}-${key}`;input.setAttribute('aria-label',`${mealNames[e.id]} ${key==='start'?'시작':'종료'}`);input.required=e.enabled;input.disabled=!e.enabled;label.append(input);pair.append(label);}enabled.onchange=()=>{for(const input of pair.querySelectorAll('input')){input.disabled=!enabled.checked;input.required=enabled.checked;}};row.append(pair);rows.append(row);}$('#mealReset').hidden=scope!=='day'||!mealDay(meals,date).custom;$('#mealError').textContent='';$('#mealOverlap').checked=false;}
  $('#mealScope').onchange=()=>{scope=$('#mealScope').value;paint();};paint();
  $('#mealReset').onclick=()=>{const next={...getState().meals,days:[...getState().meals.days.filter(d=>d.date!==date),{date,updatedAt:Date.now(),inherit:true,entries:[]}]};if(save({...getState(),meals:normalizeMeals(next)})){closeModal();onChange();toast('기본 시간으로 바꿨어.');}};
  $('#mealForm').onsubmit=e=>{e.preventDefault();const entries=Object.keys(mealNames).map(id=>({id,enabled:$('#mealEnabled-'+id).checked,start:$(`#meal-${id}-start`).value,end:$(`#meal-${id}-end`).value})),error=mealErrors(entries);if(error){$('#mealError').textContent=error;return;}
   const previous=getState(),next=normalizeMeals({...previous.meals,...(scope==='daily'?{defaults:{configured:true,updatedAt:Date.now(),entries}}:{days:[...previous.meals.days.filter(d=>d.date!==date),{date,updatedAt:Date.now(),inherit:false,entries}]})});
   const dates=scope==='day'?[date]:[...new Set([date,...schedule.map(l=>l.date),...previous.plans.map(p=>p.date)])],occurrences=dates.flatMap(d=>mealsForDate(next,d));
   if(!$('#mealOverlap').checked&&mealConflicts(occurrences,previous.plans,schedule)){$('#mealError').textContent='수업·약속과 겹치는 시간이 있어. 시간을 바꾸거나 겹침을 허용해 줘.';return;}
   if(save({...previous,meals:next})){closeModal();onChange();toast('식사시간을 저장했어.');}
  };
 };
}

