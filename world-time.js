import {sceneAssets} from './scene-assets.js?v=20261110home';
export const dayPhases=[{id:'dawn',label:'새벽',start:300},{id:'morning',label:'아침',start:420},{id:'noon',label:'점심',start:660},{id:'afternoon',label:'오후',start:840},{id:'evening',label:'저녁',start:1020},{id:'night',label:'심야',start:1200},{id:'home',label:'휴식',start:1380}];
export function worldTime(now=Date.now()){
 const local=new Date(now+9*3600000),minute=local.getUTCHours()*60+local.getUTCMinutes(),phase=[...dayPhases].reverse().find(x=>minute>=x.start)||dayPhases.at(-1);
 return {...phase,clock:`${String(local.getUTCHours()).padStart(2,'0')}:${String(local.getUTCMinutes()).padStart(2,'0')}`};
}
export function startWorldTime({openModal}){
 let preview=null;const button=document.createElement('button');button.className='worldClock';button.setAttribute('aria-label','시간과 배경');button.hidden=true;document.querySelector('.sideTools').append(button);
 function update(){const t=worldTime();const id=preview||t.id,changed=document.documentElement.dataset.dayphase!==id;document.documentElement.dataset.dayphase=id;button.textContent=`${t.clock} · ${sceneAssets[preview||t.id].name}`;if(changed)document.dispatchEvent(new CustomEvent('mediarchive:scenechange',{detail:{id}}));}
 button.onclick=()=>{openModal('<h2>배경</h2><div id="phaseChoices" class="phaseChoices"></div><p class="phaseHint">미리보기 · 닫으면 현재 시간으로 돌아가요.</p>');for(const phase of dayPhases){const b=document.createElement('button');const art=document.createElement('img'),label=document.createElement('span');art.src=sceneAssets[phase.id].src;art.alt='';art.loading='lazy';label.textContent=phase.label+' · '+sceneAssets[phase.id].name;b.append(art,label);b.setAttribute('aria-label',phase.label+' 배경');b.dataset.phase=phase.id;b.setAttribute('aria-pressed',String(phase.id===(preview||worldTime().id)));b.onclick=()=>{preview=phase.id;update();for(const x of document.querySelectorAll('#phaseChoices button'))x.setAttribute('aria-pressed',String(x===b));};document.querySelector('#phaseChoices').append(b);}};
 document.querySelector('#modal').addEventListener('close',()=>{preview=null;update();});document.addEventListener('visibilitychange',update);update();setInterval(update,15000);
}
