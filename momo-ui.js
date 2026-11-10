import {sceneStrip} from './scene-assets.js';
import {illustratedStudents} from './character-data.js';
import {schedule} from './schedule-data.js';
import {koreanDate} from './game-state.js';
import {normalizeMomo,mergeMomo,deliverMomo,scheduleMomo,suggestPlan,planStart,momoCopy} from './momo-engine.js';
const KEY='heart-companion-momo-v1';
export function createMomoUI({getStudy,getExamDate,planner,bondEvents,openModal,closeModal,onSchedule,onLaunch,toast}){
 let state=normalizeMomo(null),active=null,host=null,setTitle=null;
 try{state=normalizeMomo(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{}
 const $=s=>document.querySelector(s),node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 const student=id=>illustratedStudents.find(s=>s.id===id),lecture=id=>schedule.find(l=>l.id===id);
 const when=p=>`${Number(p.date.slice(5,7))}.${Number(p.date.slice(8))} · ${p.time}`;
 function save(next){try{localStorage.setItem(KEY,JSON.stringify(next));state=next;updateBadge();return true;}catch{toast('저장하지 못했어요. 기록을 내보내고 다시 시도해 주세요.');return false;}}
 function updateBadge(){const count=state.messages.filter(m=>!m.readAt).length+(bondEvents?.unread()||0),b=$('#momoBadge');if(b){b.hidden=!count;b.textContent=count>9?'9+':String(count);$('#momoNav').setAttribute('aria-label',count?`DM, 새 메시지 ${count}개`:'DM');}}
 function visible(){return $('.phone').dataset.view==='momo';}
 function refresh(){if(visible()&&host)render(host,setTitle);}
 function tick(){const next=deliverMomo({...state,plans:planner.momoPlans()},getStudy(),getExamDate());if(next.messages.length!==state.messages.length&&save(next))refresh();}
 function avatar(s){const wrap=node('span',undefined,'momoAvatar'),img=node('img');img.src=s.portrait;img.alt='';wrap.style.setProperty('--student-color',s.color);wrap.append(img);return wrap;}
 function bubble(text,self=false){return node('p',text,'momoBubble'+(self?' is-self':''));}
 function planFor(m){return planner.sourcePlan(m.id)||state.plans.find(p=>p.messageId===m.id); }
 function openThread(id){const next=normalizeMomo({...state,messages:state.messages.map(m=>m.student===id?{...m,readAt:m.readAt||Date.now()}:m)});save(next);active=id;bondEvents?.markRead(id);render(host,setTitle);host.scrollTop=host.scrollHeight;}
 function render(container,title){host=container;setTitle=title;host.replaceChildren();title(active?student(active).name:'DM');
  if(!active){
   host.append(sceneStrip('evening','momoScene'));
   const list=node('div',undefined,'momoThreads');
   for(const s of illustratedStudents){const messages=state.messages.filter(m=>m.student===s.id),last=messages.at(-1),special=bondEvents?.latest(s.id),latestAt=Math.max(last?.at||0,special?.at||0),unread=messages.filter(m=>!m.readAt).length+(bondEvents?.unread(s.id)||0),row=node('button',undefined,'momoThread'),info=node('span',undefined,'momoThreadInfo');row.setAttribute('aria-label',s.name+' 대화');
    info.append(node('b',s.name),node('small',special&&special.at>=(last?.at||0)?special.text:last?(planFor(last)?.status==='scheduled'?momoCopy[s.id].accept:planFor(last)?.status==='done'?momoCopy[s.id].done:momoCopy[s.id].hello):'아직 메시지가 없어'));row.append(avatar(s),info);
    const aside=node('span',undefined,'momoThreadAside');if(latestAt)aside.append(node('time',new Date(latestAt).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric'})));if(unread)aside.append(node('b',String(unread),'momoUnread'));row.append(aside);row.onclick=()=>openThread(s.id);list.append(row);
   }host.append(list);return;
  }
  const s=student(active),copy=momoCopy[active],messages=state.messages.filter(m=>m.student===active),thread=node('div',undefined,'momoConversation');thread.style.setProperty('--student-color',s.color);
  const heading=node('div',undefined,'momoContact');heading.append(avatar(s),node('span',s.subject));thread.append(heading);
  if(!messages.length&&!bondEvents?.entries(active).length)thread.append(node('p','아직 메시지가 없어','momoEmpty'));
  for(const m of messages.slice(-12)){
   const l=lecture(m.lecture),p=planFor(m),group=node('section',undefined,'momoExchange');group.append(node('time',new Date(m.at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}),'momoStamp'),bubble(copy.hello),bubble(copy.invite));
   const card=node('div',undefined,'momoInvite');card.append(node('small',`${l.date.slice(5).replace('-','.')} · ${s.subject}`),node('b',p?.title||l.title),node('span',`${p?.lecture||l.id}강 · ${p?.track||'Wiki'} · ${p?.minutes||30}분`));
   const action=node('button',p?.status==='scheduled'?'일정 보기':p?.status==='done'?'완료':'일정에 추가','momoCTA');action.disabled=p?.status==='done';action.onclick=()=>p?.status==='scheduled'?onSchedule(p.date):edit(m.id);card.append(action);group.append(card);
   if(p?.status==='scheduled'||p?.status==='done'){group.append(bubble(`${copy.reply}\n${when(p)} · ${p.minutes}분`,true),bubble(p.status==='done'?copy.done:copy.accept));}
   if(p?.status==='canceled')group.append(bubble('다른 날로 다시 잡을게.',true),bubble(copy.cancel));
   thread.append(group);
  }bondEvents?.renderMessages(thread,active,{bubble});host.append(thread);
 }
 function edit(messageId){const m=state.messages.find(x=>x.id===messageId);if(!m)return;const proposal=suggestPlan(planner.state.plans,Date.now(),30,planner.state.meals)||{};planner.edit({...proposal,sourceId:m.id,student:m.student,lecture:m.lecture,track:'Wiki',title:lecture(m.lecture).title+' 복습'});}
 updateBadge();
 return {tick,render,updateBadge,refresh,reset(){active=null;},back(){if(!active)return false;active=null;render(host,setTitle);return true;},export:()=>structuredClone(state),import(raw){if(!raw)return true;if(raw.version!==1||!Array.isArray(raw.messages)||!Array.isArray(raw.plans)||raw.messages.length>2000||raw.plans.length>2000)return false;const ok=save(mergeMomo(state,raw));const migrated=ok&&planner.importLegacyMomo(raw);if(ok)refresh();return ok&&migrated;}};
}
