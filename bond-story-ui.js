import {bondStories} from './bond-story-data.js?v=20261110ritsu';
import {outfitFor} from './wardrobe-data.js?v=20261110ritsu';
import {bondStory,bondStudents,bondLevel,normalizeBondStories,mergeBondStories,unlockBondStories,changeBondStory,storyTimeline,storyUnread} from './bond-story-engine.js?v=20261110ritsu';
import {illustratedStudents} from './character-data.js?v=20261110ritsu';
import {sceneAssets} from './scene-assets.js';
import {createCharacter} from './renderer.js?v=20261110ritsu';
import {splitDialogue} from './dialogue-pages.js';
import {teacherAddress,personalize} from './teacher-profile.js?v=20261110';

const KEY='mediarchive-bond-stories-v1';
export function createBondStoryUI({getBond,beforeOpen=()=>{},onChange=()=>{},toast}){
 let state;try{state=normalizeBondStories(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{state=normalizeBondStories(null);}
 let active=null,model=null,controller=null,generation=0,page=0,currentBeat=null,opener=null,resize=null,artReady=false;
 const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 const student=id=>illustratedStudents.find(s=>s.id===id),entry=id=>state.events.find(e=>e.id===id);
 const dialog=node('dialog',undefined,'bondStoryDialog');dialog.id='bondStoryDialog';dialog.setAttribute('aria-label','인연 이야기');document.body.append(dialog);
 const $=s=>dialog.querySelector(s);
 function save(next){try{localStorage.setItem(KEY,JSON.stringify(next));state=next;onChange();return true;}catch{toast('저장하지 못했어. 다시 시도해 줘.');return false;}}
 function act(id,action,value){const next=changeBondStory(state,id,action,value);return !!next&&save(next);}
 function tick(){const next=unlockBondStories(state,Object.fromEntries(bondStudents.map(id=>[id,bondLevel(getBond(id))])));if(JSON.stringify(next)!==JSON.stringify(state))save(next);}
 function markRead(id){let next=state;for(const e of state.events.filter(e=>bondStory(e.id).student===id&&storyUnread(e)))next=changeBondStory(next,e.id,'read');if(next!==state)save(next);}
 const entries=id=>state.events.filter(e=>bondStory(e.id).student===id);
 function latest(id){const e=entries(id).at(-1);if(!e)return null;const s=bondStory(e.id);return {at:e.completedAt||e.replyAt||e.unlockedAt,text:e.completedAt?s.dm.after.at(-1):e.dmChoice!==null?s.dm.choices[e.dmChoice].reply.at(-1):s.dm.intro.at(-1)};}
 function renderMessages(thread,id,{bubble}){
  for(const e of entries(id)){
   const story=bondStory(e.id),group=node('section',undefined,'momoExchange bondExchange');
   group.append(node('time',new Date(e.unlockedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}),'momoStamp'));
   for(const text of story.dm.intro)group.append(bubble(personalize(text)));
   if(e.dmChoice===null){const choices=node('div',undefined,'bondDmChoices');choices.setAttribute('aria-label','답장 선택');for(const [i,c] of story.dm.choices.entries()){const b=node('button',personalize(c.text));b.onclick=()=>act(e.id,'reply',i);choices.append(b);}group.append(choices);}
   else{const c=story.dm.choices[e.dmChoice];group.append(bubble(personalize(c.text),true));for(const text of c.reply)group.append(bubble(personalize(text)));
    const action=node('button',undefined,'bondVisit');action.dataset.story=e.id;action.append(node('span','✦','bondVisitMark'),node('span',e.completedAt?'추억에 담겼어':e.startedAt?'이어서 보기':story.dm.action),node('span',e.completedAt?'✓':'›'));action.disabled=!!e.completedAt;action.onclick=()=>open(e.id);group.append(action);
   }
   if(e.completedAt){const follow=node('div',undefined,'bondFollowup');follow.append(node('time',new Date(e.completedAt).toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit'}),'momoStamp'));story.dm.after.forEach(t=>follow.append(bubble(personalize(t))));group.append(follow);}
   thread.append(group);
  }
 }
 function stop(){generation++;controller?.abort();controller=null;model?.destroy();model=null;resize?.disconnect();resize=null;dialog.classList.remove('is-entering','is-highlight','is-award','is-gallery');}
 dialog.addEventListener('cancel',()=>{});
 dialog.addEventListener('close',()=>{stop();active=null;onChange();if(opener?.isConnected)opener.focus({preventScroll:true});});
 function build(story){
  const s=student(story.student);dialog.style.setProperty('--bond-accent',s.color);dialog.setAttribute('aria-label',s.name+' 인연 이야기');
  dialog.innerHTML='<div class="bondBackdrop"></div><div class="bondPortrait"><img alt=""><canvas aria-label="학생 표정"></canvas></div><div class="bondPanorama" hidden><img alt=""><button class="bondPanControl" aria-label="장면 움직임 멈추기">Ⅱ</button><div class="bondArtError" hidden><p>그림을 불러오지 못했어.</p><button>다시 시도</button></div></div><header class="bondHeader"><span></span><button class="bondClose" aria-label="나중에">×</button></header><section class="bondDialogue"><div class="bondSpeaker"></div><p class="bondLine" aria-live="polite"></p><div class="bondOptions"></div><button class="bondNext" aria-label="다음 대사">›</button></section><div class="bondBlackout" aria-hidden="true"></div>';
  $('.bondBackdrop').style.backgroundImage=`url("${sceneAssets[story.scene].src}")`;
  $('.bondPortrait img').src=outfitFor(s.id,story.outfit||'uniform')?.portrait||s.portrait;$('.bondPortrait img').alt=s.name;$('.bondHeader span').textContent=s.name;
  $('.bondClose').onclick=()=>dialog.close();$('.bondNext').onclick=next;$('.bondLine').onclick=next;
  $('.bondPanControl').onclick=()=>{const img=$('.bondPanorama>img'),paused=img.style.animationPlayState==='paused';img.style.animationPlayState=paused?'running':'paused';$('.bondPanControl').textContent=paused?'Ⅱ':'▷';$('.bondPanControl').setAttribute('aria-label',paused?'장면 움직임 멈추기':'장면 움직임 재개');};
  artReady=false;const art=$('.bondPanorama>img');art.onload=()=>{artReady=true;measureArt();$('.bondArtError').hidden=true;};art.onerror=()=>{$('.bondArtError').hidden=false;};$('.bondArtError button').onclick=()=>{art.src=story.art+'?retry='+Date.now();};art.src=story.art;art.alt=s.name+'와의 추억'+story.index;art.style.animationDirection=story.pan==='right'?'reverse':'normal';
  resize=new ResizeObserver(measureArt);resize.observe($('.bondPanorama'));
 }
 function measureArt(){const frame=$('.bondPanorama'),img=$('.bondPanorama>img');if(!frame||!img||!img.naturalWidth)return;const width=Math.max(frame.clientWidth,frame.clientHeight*img.naturalWidth/img.naturalHeight);img.style.width=width+'px';img.style.setProperty('--pan-shift',Math.min(0,frame.clientWidth-width)+'px');}
 async function open(id){
  const e=entry(id),story=bondStory(id);if(!e||e.dmChoice===null||e.completedAt||!story)return;
  beforeOpen();if(!act(id,'start'))return;opener=document.activeElement;stop();active=id;page=0;currentBeat=null;build(story);dialog.showModal();dialog.classList.add('is-entering');const gen=generation;setTimeout(()=>{if(gen===generation)dialog.classList.remove('is-entering');},550);renderBeat();$('.bondClose').focus();
  controller=new AbortController();try{const instance=await createCharacter($('.bondPortrait canvas'),{manifest:student(story.student).model,personality:story.student,outfit:story.outfit||'uniform',framing:'portrait',visibilityRoot:dialog,isVisible:()=>dialog.open&&!dialog.classList.contains('is-highlight')&&!dialog.classList.contains('is-award')&&generation===gen,signal:controller.signal,releaseContext:true,onError:()=>{if(generation===gen){$('.bondPortrait img').hidden=false;$('.bondPortrait canvas').hidden=true;}}});if(gen!==generation||!dialog.open){instance.destroy();return;}model=instance;$('.bondPortrait img').hidden=true;perform();}catch(error){if(gen===generation&&dialog.open)$('.bondPortrait canvas').hidden=true;}
 }
 function pages(){return splitDialogue(personalize(currentBeat?.text||''),62);}
 function perform(){if(!currentBeat)return;if(['teacher','narrator'].includes(currentBeat.speaker)){model?.setExpression(currentBeat.expression||'smile');return;}model?.speak({text:pages()[page],expression:currentBeat.expression||'smile'},pages()[page]);}
 function renderBeat(){
  const e=entry(active),story=bondStory(active);if(!e||!story)return;const timeline=storyTimeline(story,e);currentBeat=timeline[e.cursor];const lines=pages();page=Math.min(page,Math.max(0,lines.length-1));
  const highlight=currentBeat.kind==='highlight';dialog.classList.toggle('is-highlight',highlight);$('.bondPanorama').hidden=!highlight;$('.bondPortrait').hidden=highlight;$('.bondBackdrop').style.backgroundImage=`url("${highlight?story.art:sceneAssets[story.scene].src}")`;
  if(highlight){measureArt();$('.bondPanorama>img').style.animationPlayState='running';$('.bondPanControl').textContent='Ⅱ';}
  $('.bondSpeaker').textContent=currentBeat.speaker==='teacher'?teacherAddress():currentBeat.speaker==='narrator'?'':student(story.student).name;
  $('.bondDialogue').classList.toggle('is-narrator',currentBeat.speaker==='narrator');$('.bondLine').textContent=lines[page]||'';
  const options=$('.bondOptions');options.replaceChildren();const choosing=currentBeat.choices&&!Object.hasOwn(e.choices,currentBeat.choiceIndex)&&page===lines.length-1;
  $('.bondNext').hidden=!!choosing;$('.bondLine').style.cursor=choosing?'default':'pointer';
  if(choosing)for(const [i,c] of currentBeat.choices.entries()){const b=node('button',personalize(c.text));b.onclick=()=>{if(act(active,'choose',i)){page=0;renderBeat();}};options.append(b);}
  const last=e.cursor===timeline.length-1&&page===lines.length-1;$('.bondNext').textContent=last?'마침':'›';$('.bondNext').setAttribute('aria-label',last?'이야기 마침':'다음 대사');perform();
 }
 function next(){if(!active||dialog.classList.contains('is-award')||dialog.classList.contains('is-gallery'))return;const e=entry(active);if(!e)return;if(currentBeat.kind==='highlight'&&!artReady){toast('그림을 불러오는 중이야.');return;}if(page<pages().length-1){page++;renderBeat();return;}if(currentBeat.choices&&!Object.hasOwn(e.choices,currentBeat.choiceIndex))return;
  const timeline=storyTimeline(bondStory(active),e);if(e.cursor===timeline.length-1){if(act(active,'complete')){award();tick();}return;}if(act(active,'next')){page=0;renderBeat();}
 }
 function award(){
  const story=bondStory(active),s=student(story.student);model?.destroy();model=null;resize?.disconnect();resize=null;dialog.classList.add('is-award');dialog.innerHTML='';
  const card=node('section',undefined,'bondAward'),frame=node('div',undefined,'bondPhotoFrame'),img=node('img');img.src=story.art;img.alt=s.name+'와의 추억'+story.index;frame.append(img);card.append(node('span','✦','bondAwardStar'),frame,node('h2',`${s.name}와의 추억${story.index}`),node('p','업데이트 되었습니다!'));const done=node('button','확인','bondAwardDone');done.onclick=()=>dialog.close();card.append(done);dialog.append(card);done.focus();
 }
 function gallery(container,id){
  const stories=bondStories.filter(s=>s.student===id);if(!stories.length)return;
  const section=node('section',undefined,'bondGallery');section.append(node('h3','다시보기'));const grid=node('div',undefined,'bondGalleryGrid');
  for(const story of stories){const unlocked=!!entry(story.id)?.completedAt,b=node('button',undefined,'bondMemoryTile');b.disabled=!unlocked;b.setAttribute('aria-label',unlocked?`${student(id).name}와의 추억${story.index}`:`인연 ${story.level} · 잠김`);
   if(unlocked){const img=node('img');img.src=story.art;img.alt='';img.loading='lazy';b.append(img);b.onclick=()=>viewArt(story);}
   else b.append(node('span','◇','bondMemoryLock'));
   b.append(node('span',unlocked?`추억 ${story.index}`:`인연 ${story.level}`,'bondMemoryCaption'));grid.append(b);
  }section.append(grid);container.append(section);
 }
 function viewArt(story){if(!entry(story.id)?.completedAt)return;opener=document.activeElement;stop();active=null;dialog.innerHTML='';dialog.classList.add('is-gallery');dialog.setAttribute('aria-label',student(story.student).name+'와의 추억'+story.index);const close=node('button','×','bondClose');close.setAttribute('aria-label','닫기');close.onclick=()=>dialog.close();const img=node('img',undefined,'bondGalleryArt');img.src=story.art;img.alt=student(story.student).name+'와의 추억'+story.index;dialog.append(img,close);dialog.showModal();close.focus();}
 window.addEventListener('storage',event=>{if(event.key!==KEY||!event.newValue)return;try{state=mergeBondStories(state,JSON.parse(event.newValue));onChange();}catch{}});
 return {tick,entries,latest,markRead,renderMessages,gallery,open,unread:id=>state.events.filter(e=>!id||bondStory(e.id).student===id).reduce((n,e)=>n+storyUnread(e),0),export:()=>structuredClone(state),import(raw){if(!raw)return true;if(raw.version!==1||!Array.isArray(raw.events)||raw.events.length>bondStories.length)return false;return save(mergeBondStories(state,raw));},get state(){return state;}};
}
