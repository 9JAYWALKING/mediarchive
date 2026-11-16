import {illustratedStudents} from './character-data.js?v=20261115akariVoice1';
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
export function guidePortrait(id){
 const s=illustratedStudents.find(s=>s.id===id)||illustratedStudents[0],wrap=node('span',undefined,'momoAvatar');
 wrap.dataset.student=s.id;wrap.style.setProperty('--student-color',s.color);
 const img=node('img');img.src=s.portrait;img.alt='';img.decoding='async';wrap.append(img);return wrap;
}
export function createGuideSurfaces({act,deferMeal,open,overview,canNotify,onChange,onShown=()=>{}}){
 let current=null,signature='',queued=null,shown=null,until=0,shownAt=0;
 const banner=node('button',undefined,'guideNotification');banner.hidden=true;banner.setAttribute('aria-live','polite');document.querySelector('.phone').append(banner);
 banner.onclick=()=>{const owner=shown?.student;dismiss();if(owner)open(owner);};
 function dismiss(){banner.hidden=true;shown=null;until=0;}
 function sync(c){
  current=c;
  const key=JSON.stringify(c);
  if(key!==signature){signature=key;onChange();home(c);}
  if(shown&&['invite','check','meal'].includes(shown.kind)&&shown.id!==c?.noticeId)dismiss();
  if(document.hidden||!canNotify()){dismiss();return;}
  if(shown&&Date.now()>until)dismiss();
  if(queued&&!shown&&Date.now()-shownAt>60000){
   const m=queued;queued=null;
   if(['invite','check','meal'].includes(m.kind)&&m.student!==current?.student)return;
   if(['invite','check','meal'].includes(m.kind)&&m.id!==current?.noticeId)return;
   shown=m;shownAt=Date.now();until=Date.now()+8000;
   const s=illustratedStudents.find(s=>s.id===m.student),body=node('span',undefined,'guideNotificationBody');
   body.append(node('b',s.name+' · DM'),node('span',m.text));banner.replaceChildren(guidePortrait(s.id),body);banner.hidden=false;onShown(m);
  }
 }
 function home(c){
  const context=document.querySelector('#eventContext');context.querySelector('.guideHomePortrait')?.remove();
  context.classList.toggle('hasGuidePortrait',!!c);
  if(c){const face=guidePortrait(c.student);face.classList.add('guideHomePortrait');context.prepend(face);context.setAttribute('aria-label',`${illustratedStudents.find(s=>s.id===c.student)?.name} DM · ${c.title}`);}
 }
 function draw(container,owner,compact=false){
  const slot=node('div',undefined,'guideSlot');slot.dataset.owner=owner||'';slot.dataset.compact=String(compact);container.append(slot);fill(slot,owner,compact);
 }
 function redraw(host){
  for(const slot of host.querySelectorAll('.guideSlot')){
   const expanded=slot.querySelector('details')?.open;
   const buttons=[...slot.querySelectorAll('button,summary')],focusIndex=buttons.indexOf(document.activeElement);
   slot.replaceChildren();fill(slot,slot.dataset.owner,slot.dataset.compact==='true');
   if(expanded&&slot.querySelector('details'))slot.querySelector('details').open=true;
   if(focusIndex>=0)slot.querySelectorAll('button,summary')[focusIndex]?.focus({preventScroll:true});
  }
 }
 function fill(container,owner,compact=false){
  const c=current;if(!c)return;
  if(owner&&owner!==c.student)compact=true;
  const s=illustratedStudents.find(s=>s.id===c.student);if(!s)return;
  const card=node('section',undefined,'guideCurrent'+(compact?' is-compact':''));card.style.setProperty('--guide-accent',s.color);
  card.dataset.guideId=c.id;
  const header=node('div',undefined,'guideCurrentHeader'),contact=node('button',undefined,'guideContact');contact.append(guidePortrait(s.id),node('span',s.name));contact.onclick=()=>open(s.id);
  header.append(contact,node('span',c.kind==='focus'?'함께하는 중':c.kind==='check'?'마지막 확인':'지금','guideState'));card.append(header);
  const title=node('h3',c.title),meta=node('small',[c.time,c.lecture?`${c.lecture}강 · ${c.material}`:c.material].filter(Boolean).join(' · '),'guideMeta');card.append(title,meta);
  card.append(node('p',compact?c.text:(c.goal||c.text),'guideCurrentLine'));
  if(!compact&&c.goal){const details=node('details',undefined,'guideDetails');details.append(node('summary','안내'),node('p',c.text));if(c.sources)details.append(node('p',c.sources));card.append(details);}
  const actions=node('div',undefined,'guideCurrentActions'),main=node('button',c.label,'guidePrimary');main.onclick=()=>act(c.id);actions.append(main);
  if(compact||c.action!=='day'){const secondary=node('button',c.kind==='meal'?'30분 뒤':compact?'DM':'일정','guideSecondary');secondary.onclick=()=>c.kind==='meal'?deferMeal(c.id):compact?open(s.id):overview();actions.append(secondary);}card.append(actions);container.append(card);
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)dismiss();});
 return {sync,draw,redraw,notify(m){queued=m;},read(student){if(queued?.student===student)queued=null;if(shown?.student===student)dismiss();},get current(){return current;},dismiss};
}
