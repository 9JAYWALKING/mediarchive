import {expressionNames,expressionLabels} from './expressions.js';
import {createDialoguePager} from './dialogue-pages.js';
import {createCharacter} from './renderer.js';
import {illustratedStudents} from './character-data.js';
import {characterStories} from './character-stories.js';
import {routineLine} from './routine-service.js';
import {appearanceFor} from './wardrobe-service.js';
import {outfitLabels} from './wardrobe-engine.js';

export function createCharacterViewer(){
 const dialog=document.createElement('dialog');dialog.id='characterViewer';dialog.className='characterViewer';
 dialog.innerHTML='<div class="viewerRoom" aria-hidden="true"></div><header class="viewerHeader"><button class="viewerBack" aria-label="감상 닫기">‹</button><div><small id="viewerSubject"></small><h2 id="viewerName"></h2></div><button id="viewerMotion" class="viewerRound" aria-label="움직임 멈추기" disabled></button></header><div class="viewerStage"><img id="viewerFallback" alt=""><div id="viewerCanvasHost"></div><button id="viewerTouch" aria-label="말 걸기"></button></div><p id="viewerStatus" role="status"></p><button id="viewerRetry" hidden>다시 시도</button><footer class="viewerFooter"><div class="viewerDialogue"><span id="viewerSpeaker"></span><p id="viewerLine" aria-live="polite"></p><button id="viewerNextLine" aria-label="다음 대사">›</button></div><div class="viewerSwitch" role="group" aria-label="학생 선택"></div></footer>';
 dialog.setAttribute('aria-labelledby','viewerName');document.body.append(dialog);
 const storyBar=document.createElement('div');storyBar.className='viewerStoryBar';storyBar.hidden=true;storyBar.innerHTML='<span id="viewerStoryTitle"></span><small id="viewerStoryStep"></small><button id="viewerEndStory" aria-label="이야기 닫기">닫기</button>';dialog.querySelector('.viewerFooter').prepend(storyBar);
 const $=s=>dialog.querySelector(s),motionButton=$('#viewerMotion'),host=$('#viewerCanvasHost'),fallback=$('#viewerFallback');
 let active=illustratedStudents[0],character=null,generation=0,controller=null,lineIndex=0,lastTouch=0,opener=null,story=null,beat=0,motionEnabled=null,routineTimer=null,lastLineAt=0,outfitRequest=0;
 const dialoguePages=createDialoguePager(58);let currentLine=null;
 function performLine(){if(expressionSelect.value==='auto')character?.speak(currentLine,dialoguePages.text);}
 function showLine(line){currentLine=typeof line==='string'?{text:line}:line;dialoguePages.set(currentLine.text);$('#viewerLine').textContent=dialoguePages.text;lastLineAt=Date.now();performLine();storyControls();}
 function timeLine(){return routineLine(active.id,{force:true})||active.greeting;}
 const nowButton=document.createElement('button');nowButton.className='viewerNow';nowButton.textContent='지금';nowButton.onclick=()=>{if(story)return;showLine(timeLine());character?.react();};$('.viewerDialogue').append(nowButton);
 const looks=document.createElement('div');looks.className='viewerLooks';$('.viewerFooter').append(looks);
 const outfitRow=document.createElement('label');outfitRow.className='outfitPicker';outfitRow.textContent='복장';const outfitSelect=document.createElement('select');outfitSelect.setAttribute('aria-label','복장');for(const [id,label] of Object.entries({auto:'자동',...outfitLabels})){const option=document.createElement('option');option.value=id;option.textContent=label;outfitSelect.append(option);}outfitRow.append(outfitSelect);looks.append(outfitRow);
 outfitSelect.onchange=async()=>{const gen=generation,request=++outfitRequest;if(!character)return;$('#viewerStatus').textContent='갈아입는 중…';const ok=await character.setOutfit(outfitSelect.value);if(gen!==generation||request!==outfitRequest)return;if(ok)$('#viewerStatus').textContent='';else{$('#viewerStatus').textContent='복장을 불러오지 못했어요. 다시 골라 주세요.';outfitSelect.value=character.outfit;await character.setOutfit(character.outfit);}};
 const expressionRow=document.createElement('label');expressionRow.className='expressionPicker';expressionRow.textContent='표정';const expressionSelect=document.createElement('select');expressionSelect.setAttribute('aria-label','표정');const autoOption=document.createElement('option');autoOption.value='auto';autoOption.textContent='자동';expressionSelect.append(autoOption);for(const [i,name] of expressionNames.entries()){const option=document.createElement('option');option.value=name;option.textContent=expressionLabels[i];expressionSelect.append(option);}expressionSelect.onchange=()=>{if(expressionSelect.value==='auto')performLine();else character?.setExpression(expressionSelect.value);};expressionRow.append(expressionSelect);looks.append(expressionRow);
 const icon=name=>`<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
 function updateMotion(){motionButton.innerHTML=icon(character?.motion?'pause':'play');motionButton.setAttribute('aria-label',character?.motion?'움직임 멈추기':'움직임 켜기');motionButton.setAttribute('aria-pressed',String(!!character?.motion));}
 function stop(){generation++;outfitRequest++;controller?.abort();controller=null;character?.destroy();character=null;host.replaceChildren();}
 function unavailable(){fallback.hidden=false;$('#viewerStatus').textContent='움직임을 불러오지 못했어요.';motionButton.disabled=true;$('#viewerRetry').hidden=false;}
 function storyControls(){
  storyBar.hidden=!story;nowButton.hidden=!!story;dialog.dataset.mode=story?'story':'portrait';
  if(story){$('#viewerStoryTitle').textContent=story.title;$('#viewerStoryStep').textContent=`${beat+1} / ${story.beats.length}`;}
  const last=story&&beat===story.beats.length-1&&!dialoguePages.hasNext;$('#viewerNextLine').textContent=last?'✓':'›';$('#viewerNextLine').setAttribute('aria-label',last?'이야기 마침':dialoguePages.hasNext?'다음 대사':story?'이야기 다음':'다음 대사');
 }
 async function select(id,{preserveStory=false}={}){
  if(!preserveStory)story=null;
  stop();const current=generation;active=illustratedStudents.find(x=>x.id===id)||illustratedStudents[0];lineIndex=0;lastTouch=0;expressionSelect.value='auto';
  dialog.dataset.student=active.id;dialog.style.setProperty('--character-accent',active.color);
  $('#viewerSubject').textContent=`${active.grade}학년 · ${active.subject}`;$('#viewerName').textContent=active.name;
  $('#viewerSpeaker').textContent=active.name;showLine(story?story.beats[beat].text:(routineLine(active.id)||active.greeting));storyControls();
  fallback.src=appearanceFor(active.id,outfitSelect.value)?.portrait||active.portrait;fallback.alt=active.name;fallback.hidden=false;
  $('#viewerTouch').setAttribute('aria-label',active.name+'에게 말 걸기');
  for(const b of dialog.querySelectorAll('[data-character]'))b.setAttribute('aria-pressed',String(b.dataset.character===active.id));
  $('#viewerStatus').textContent='불러오는 중…';$('#viewerRetry').hidden=true;motionButton.disabled=true;outfitSelect.disabled=true;
  const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');host.append(canvas);
  controller=new AbortController();
  try{
   const instance=await createCharacter(canvas,{manifest:active.model,personality:active.id,outfit:outfitSelect.value,framing:'portrait',visibilityRoot:dialog,isVisible:()=>dialog.open&&generation===current,signal:controller.signal,releaseContext:true,onError:unavailable,onAppearanceChange:look=>{if(look&&generation===current){fallback.src=look.portrait;dialog.dataset.outfit=look.id;}},onAppearanceError:()=>{if(generation===current)$('#viewerStatus').textContent='복장을 불러오지 못했어요. 다시 골라 주세요.';},onMotionChange:value=>{motionEnabled=value;updateMotion();}});
   if(current!==generation||!dialog.open){instance.destroy();return;}
   character=instance;performLine();if(motionEnabled!==null)character.setMotion(motionEnabled);fallback.hidden=true;$('#viewerStatus').textContent='';motionButton.disabled=false;outfitSelect.disabled=false;updateMotion();
  }catch(error){if(current!==generation||error.name==='AbortError')return;canvas.hidden=true;unavailable();}
 }
 for(const student of illustratedStudents){const b=document.createElement('button');b.dataset.character=student.id;b.textContent=student.name;b.onclick=()=>{if(active.id!==student.id||story)select(student.id);};$('.viewerSwitch').append(b);}
 function endStory(){story=null;storyControls();showLine(active.greeting);character?.react();}
 function talk(){
  if(Date.now()-lastTouch<250)return;lastTouch=Date.now();
  if(dialoguePages.next()){$('#viewerLine').textContent=dialoguePages.text;lastLineAt=Date.now();performLine();storyControls();return;}
  if(story){
   if(beat===story.beats.length-1){endStory();return;}
   beat++;const entry=story.beats[beat];
   if(entry.speaker!==active.id)select(entry.speaker,{preserveStory:true});else{showLine(entry.text);storyControls();character?.react();}
   return;
  }
  showLine(active.lines[lineIndex++%active.lines.length]);character?.react();
 }
 $('#viewerTouch').onclick=talk;$('#viewerNextLine').onclick=talk;
 $('.viewerStage').onpointermove=e=>{if(e.pointerType==='touch')return;const r=e.currentTarget.getBoundingClientRect();character?.look((e.clientX-r.left)/r.width*1.6-.8);};
 $('.viewerStage').onpointerleave=()=>character?.look(0);
 motionButton.onclick=()=>{if(character){motionEnabled=!character.motion;character.setMotion(motionEnabled);updateMotion();}};
 $('#viewerRetry').onclick=()=>select(active.id,{preserveStory:!!story});$('#viewerEndStory').onclick=endStory;
 $('.viewerBack').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{clearInterval(routineTimer);routineTimer=null;stop();opener?.focus();});
 return {open(id,storyId=null){opener=document.activeElement;outfitSelect.value='auto';if(!dialog.open)dialog.showModal();clearInterval(routineTimer);routineTimer=setInterval(()=>{if(!dialog.open||story||dialoguePages.hasNext||document.hidden||Date.now()-lastLineAt<90000)return;const line=routineLine(active.id);if(line){showLine(line);character?.react();}},1000);story=characterStories.find(x=>x.id===storyId)||null;beat=0;select(story?story.beats[0].speaker:id,{preserveStory:!!story});$('.viewerBack').focus();}};
}
