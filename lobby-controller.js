import {illustratedStudents} from './character-data.js?v=20261110ritsu';
import {createCharacter} from './renderer.js?v=20261110ritsu';
import {appearanceFor} from './wardrobe-service.js?v=20261110ritsu';
import {teacherProfile,saveTeacher} from './teacher-profile.js?v=20261110';
export function createLobbyController({getStudents,onSelect,onReady,onMotionChange,openModal,closeModal}){
 const $=s=>document.querySelector(s);let selected=teacherProfile().lobby,model=null,controller=null,generation=0,lastSwipe=0,presented=false;
 const stage=$('#stage'),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const initial=document.createElement('div');initial.className='lobbyInitial';initial.hidden=true;$('#stage').append(initial);
 function ids(){return illustratedStudents.map(s=>s.id);}
 function cycle(delta){const list=ids();select(list[(Math.max(0,list.indexOf(selected))+delta+list.length)%list.length]);}
 function picker(){openModal('<h2>홈 학생</h2><div id="lobbyChoices" class="lobbyChoices"></div>');for(const s of illustratedStudents){const b=document.createElement('button');b.className='lobbyChoice';const img=document.createElement('img');img.src=s.portrait;img.alt='';const name=document.createElement('b');name.textContent=s.name;b.append(img,name);b.setAttribute('aria-pressed',String(s.id===selected));b.onclick=()=>{closeModal();select(s.id);};$('#lobbyChoices').append(b);}}
 async function select(id,{greet=true,persist=true}={}){
  const student=getStudents().find(s=>s.id===id)||getStudents()[0],art=illustratedStudents.find(s=>s.id===student.id);id=student.id;selected=id;const gen=++generation;controller?.abort();controller=new AbortController();
  stage.classList.add('is-changing');
  if(presented&&!reducedMotion.matches)await new Promise(resolve=>setTimeout(resolve,180));
  if(gen!==generation)return;
  model?.destroy();model=null;onReady(null);
  const reveal=()=>{if(gen!==generation)return;presented=true;requestAnimationFrame(()=>{if(gen===generation)stage.classList.remove('is-changing');});};
  if(persist)saveTeacher({lobby:id});$('.studentName .dept').textContent=`${art?.grade||2}학년 · ${student.subject}`;$('.studentName h1').replaceChildren(document.createTextNode(student.name+' '));const roman=document.createElement('span');roman.textContent=art?.roman||'';$('.studentName h1').append(roman);$('.nameplate').replaceChildren(document.createTextNode(student.name+' '));const small=document.createElement('small');small.textContent=art?.roman||'';$('.nameplate').append(small);$('#touch').setAttribute('aria-label',student.name+'에게 말 걸기');$('#fallback').alt=student.name;
  $('.phone').dataset.student=id;$('.phone').style.setProperty('--student-accent',student.color);$('#motionToggle').hidden=!art;$('#fallback').hidden=!art;initial.hidden=!!art;initial.textContent=student.name.slice(0,1);initial.style.setProperty('--student-color',student.color);
  const old=$('#character'),canvas=document.createElement('canvas');canvas.id='character';canvas.setAttribute('aria-hidden','true');old.replaceWith(canvas);canvas.hidden=!art;$('#loadStatus').textContent=art?'불러오는 중…':'';$('#loadStatus').onclick=null;onSelect(id,greet);if(!art){reveal();return;}
  $('#fallback').src=appearanceFor(id)?.portrait||art.portrait;
  try{const instance=await createCharacter(canvas,{manifest:art.model,personality:id,signal:controller.signal,releaseContext:true,onMotionChange,onAppearanceChange:look=>{if(look&&gen===generation)$('#fallback').src=look.portrait;}});if(gen!==generation){instance.destroy();return;}model=instance;onReady(instance);$('#fallback').hidden=true;$('#loadStatus').textContent='';reveal();}catch(error){if(gen!==generation||error.name==='AbortError')return;canvas.hidden=true;$('#loadStatus').textContent='다시 불러오기';$('#loadStatus').onclick=()=>select(id,{greet:false});reveal();}
 }
 let origin=null;const touch=$('#touch');touch.style.touchAction='pan-y';touch.addEventListener('pointerdown',e=>{origin={x:e.clientX,y:e.clientY};});touch.addEventListener('pointerup',e=>{if(!origin)return;const dx=e.clientX-origin.x,dy=e.clientY-origin.y;origin=null;if(Math.abs(dx)>=50&&Math.abs(dx)>Math.abs(dy)*1.5){lastSwipe=Date.now();cycle(dx<0?1:-1);}});touch.addEventListener('pointercancel',()=>origin=null);
 return {select,picker,get id(){return selected;},get swiped(){return Date.now()-lastSwipe<400;}};
}
