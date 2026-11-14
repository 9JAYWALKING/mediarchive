import {wardrobeSettings,saveWardrobe,currentOutfit} from './wardrobe-service.js?v=20261114senaBlack6';
import {wardrobeSettingsError,outfitLabels} from './wardrobe-engine.js';
import {outfitFor} from './wardrobe-data.js?v=20261114senaBlack6';

export function openWardrobeSettings({openModal,closeModal,toast}){
 const settings=wardrobeSettings();
 openModal('<h2>복장</h2><div class="wardrobeCollection" aria-label="하루의 복장"></div><form id="wardrobeForm"><div class="wardrobeTimes"><label>교복<input type="time" id="wardrobeUniform" aria-label="교복으로 바꾸는 시간" required></label><label>잠옷<input type="time" id="wardrobeSleep" aria-label="잠옷으로 바꾸는 시간" required></label></div><div class="wardrobeDinner"><strong>사복</strong><span>저녁 식사 후</span></div><label class="wardrobeFallback">저녁 미설정<input type="time" id="wardrobeDinner" aria-label="저녁 식사가 없을 때 사복으로 바꾸는 시간" required></label><p id="wardrobeError" class="wardrobeError" role="status"></p><button class="action solid" type="submit">저장</button></form>');
 const $=selector=>document.querySelector(selector),current=currentOutfit().id;
 for(const id of Object.keys(outfitLabels)){
  const card=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');
  card.dataset.outfit=id;card.className='wardrobeCard';img.src=outfitFor('haru',id).portrait;img.alt='';caption.textContent=outfitLabels[id];
  if(id===current){card.classList.add('is-current');caption.append(document.createTextNode(' · 지금'));}
  card.append(img,caption);$('.wardrobeCollection').append(card);
 }
 $('#wardrobeUniform').value=settings.uniformAt;$('#wardrobeSleep').value=settings.sleepAt;$('#wardrobeDinner').value=settings.dinnerAt;
 $('#wardrobeForm').onsubmit=event=>{
  event.preventDefault();const next={version:1,uniformAt:$('#wardrobeUniform').value,sleepAt:$('#wardrobeSleep').value,dinnerAt:$('#wardrobeDinner').value};
  const error=wardrobeSettingsError(next);if(error){$('#wardrobeError').textContent=error;return;}
  if(!saveWardrobe(next)){$('#wardrobeError').textContent='저장하지 못했어. 다시 시도해 줘.';return;}
  closeModal();toast('복장 시간을 저장했어.');
 };
}
