import {schedule} from './schedule-data.js';
import {tracks,haruLessons,koreanDate,validDate,examCountdown,normalizePreferences,normalizeChoice,shiftDate} from './game-state.js';

import {illustratedStudents} from './character-data.js';
import {createCharacterViewer} from './character-viewer.js';
import {storiesFor} from './character-stories.js';
import {createStatisticsUI} from './statistics-ui.js';
import {unifiedRecords} from './statistics-engine.js';
const KEY='heart-companion-shell-v1';
export function createGameUI({getState,getQuiz,getGrowth,reviews,momo,planner,quests,openModal,closeModal,onStart,onTalk,onCoverage,onGrowth,toast,format}){
 const $=s=>document.querySelector(s),screen=$('#screen'),body=$('#screenContent');
 const characterViewer=createCharacterViewer();
 let prefs;try{prefs=normalizePreferences(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{prefs=normalizePreferences(null);}
 let view='home',selectedDate=koreanDate(),studentDetail=false,lastDate='',dailySources=[],dailyCache=0;
 const statistics=createStatisticsUI({getLiveData:()=>({study:getState(),planner:planner.state}),getData:()=>({study:getState(),planner:planner.state,growth:getGrowth(),bond:getQuiz().score,quiz:getQuiz().export(),reviews:reviews.export()}),onProfile:id=>{show('students');studentDetail=id;render();body.scrollTop=0;},onPlan:id=>planner.edit({student:id})});
 const icon=name=>`<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(prefs));return true;}catch{toast('설정 저장 실패');return false;}}
 function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
 function show(next){view=next;studentDetail=false;$('.phone').dataset.view=next;screen.hidden=next==='home';for(const b of document.querySelectorAll('[data-nav]')){const active=b.dataset.nav===next;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}if(next!=='home'){render();body.scrollTop=0;$('#screenTitle').focus();}}
 function title(text){$('#screenTitle').textContent=text;screen.dataset.section=view;}
 function render(){body.replaceChildren();if(view==='students')renderStudents();else if(view==='schedule')renderSchedule();else if(view==='records')renderRecords();else if(view==='momo')momo.render(body,title);else if(view==='quests'){title('퀘스트');quests.render(body);}}
 function activeChoice(){return normalizeChoice(getState().session?.context||prefs.choice);}
 function update(){
  const growth=getGrowth();$('.starLine>b').textContent='Lv. '+growth.level;$('.stars').textContent='★'.repeat(growth.stars)+'☆'.repeat(3-growth.stars);$('.stars').setAttribute('aria-label',`성급 ${growth.stars}성`);
  const now=Date.now(),today=koreanDate(now),d=examCountdown(prefs.examDate,now);$('#examButton').dataset.phase=d.days<0?'past':d.days===0?'today':d.days<=7?'near':'normal';$('#examCount').textContent=d.label;$('#examDate').textContent=prefs.examDate.slice(5).replace('-','.');$('#examButton').setAttribute('aria-label',`시험 ${d.label}, ${prefs.examDate}, 날짜 변경`);
  const st=getState(),sources=[st.growth,st.memories,planner.state.records,planner.state.plans,today];if(sources.some((v,i)=>v!==dailySources[i])){dailySources=sources;dailyCache=unifiedRecords(st,planner.state).filter(m=>m.student&&koreanDate(m.at)===today).reduce((a,b)=>a+b.duration,0);}$('#dailyTime').textContent=Math.floor(dailyCache/60000)+'분';
  const c=activeChoice(),l=schedule.find(x=>x.id===c.lecture),legacy=st.session&&!st.session.context;$('#contextName').textContent=legacy?'하루':l.title;$('#contextTrack').textContent=legacy?'자유':c.track;$('#eventContext').disabled=!!st.session;
  $('#eventContext').setAttribute('aria-label',st.session?(legacy?'하루 · 자유':`${l.title} ${c.track}`):'이벤트 선택');
  statistics.updateLive();
  if(lastDate&&today!==lastDate&&view!=='home')render();lastDate=today;
 }
 function examEditor(){
  openModal('<h2>시험</h2><form id="examForm"><label class="fieldLabel" for="examInput">날짜</label><input type="date" id="examInput" min="2000-01-01" max="2099-12-31" required><p id="examError" role="status"></p><button class="action solid" type="submit">저장</button></form>');
  $('#examInput').value=prefs.examDate;$('#examForm').onsubmit=e=>{e.preventDefault();const value=$('#examInput').value;if(!validDate(value)){$('#examError').textContent='날짜를 확인해 주세요.';return;}prefs.examDate=value;if(persist()){update();closeModal();}};
 }
 function launch(lecture,selectedTrack,planId){
  if(quests.resting){quests.restOpen();return;}
  if(planner.focus){toast('진행 중인 약속을 먼저 마쳐 줘.');return;}
  if(getState().session){toast('진행 중인 이벤트를 먼저 종료해 주세요.');show('home');return;}
  let choice=normalizeChoice(lecture?{lecture,track:selectedTrack||prefs.choice.track}:prefs.choice),mode=getGrowth().cycles?'familiar':'new';
  openModal('<div class="sheetEyebrow">하루</div><h2>이벤트</h2><div class="lectureChoices" id="lectureChoices"></div><div class="trackChoices" id="trackChoices" role="group" aria-label="자료"></div><div class="studyMode" role="group" aria-label="내용의 익숙함"><button data-mode="new">새로운 내용</button><button data-mode="familiar">익숙한 내용</button></div><button class="action solid" id="launchEvent">시작</button>');
  function mark(){for(const b of document.querySelectorAll('[data-lesson]'))b.setAttribute('aria-pressed',String(Number(b.dataset.lesson)===choice.lecture));for(const b of document.querySelectorAll('[data-track]'))b.setAttribute('aria-pressed',String(b.dataset.track===choice.track));for(const b of document.querySelectorAll('.studyMode [data-mode]'))b.setAttribute('aria-pressed',String(b.dataset.mode===mode));}
  for(const b of document.querySelectorAll('.studyMode button'))b.onclick=()=>{mode=b.dataset.mode;mark();};
  for(const id of haruLessons){const l=schedule.find(x=>x.id===id),b=node('button',undefined,'lectureChoice');b.dataset.lesson=id;b.append(node('small',String(id).padStart(2,'0')),node('span',l.title));b.onclick=()=>{choice.lecture=id;mark();};$('#lectureChoices').append(b);}
  for(const track of tracks){const b=node('button',track);b.dataset.track=track;b.onclick=()=>{choice.track=track;mark();};$('#trackChoices').append(b);}mark();
  $('#launchEvent').onclick=()=>{prefs.choice=choice;persist();closeModal();show('home');const linked=planner.state.plans.find(p=>p.id===planId);onStart(choice,mode,linked?.lecture===choice.lecture&&linked?.track===choice.track?planId:undefined);update();};
 }
 function renderStudents(){
  const growth=getGrowth(),rating='★'.repeat(growth.stars)+'☆'.repeat(3-growth.stars);
  title(studentDetail?(illustratedStudents.find(x=>x.id===studentDetail)?.name||'하루'):'학생');
  if(!studentDetail){statistics.render(body,{historyOpen:false,mode:'students'});return;}
  if(studentDetail!=='haru'){renderPortraitStudent(studentDetail);return;}
  const q=getQuiz(),score=Math.max(0,q.score+reviews.delta('haru')),level=1+Math.floor(score/100);
  const banner=node('div',undefined,'studentBanner');banner.innerHTML='<span class="bannerCrest">'+icon('heart')+'</span><img src="./assets/haru-fresh-airy.png" alt="하루"><div><span>심장생리 · 1학년</span><h3>하루</h3><b>Lv. '+growth.level+'</b><div class="rating">'+rating+'</div></div>';body.append(banner);
  appendPortraitAction('haru');
  const growthButton=node('button',undefined,'growthProfileButton');growthButton.append(node('span','성장'),node('small',growth.cycles>=5?'완성':(growth.cycles<3?'학생 '+(growth.stars+1)+'성':'악세사리 '+(growth.accessory+1)+'성')+' · '+growth.done.length+'/9  ›'));growthButton.onclick=onGrowth;body.append(growthButton);
  const bond=node('section',undefined,'infoCard bondCard');bond.innerHTML=`<div class="cardHeading">${icon('heart')}<h3>인연</h3><b>${level}</b></div><progress max="100" value="${score%100}" aria-label="인연 진행도"></progress><small>${score%100} / 100</small>`;body.append(bond);
  const abilities=node('section',undefined,'infoCard abilitiesCard');abilities.append(node('h3','능력'));
  ['이해','판단','응용'].forEach((name,i)=>{const ability=growth.abilities[tracks[i]];const row=node('div',undefined,'abilityRow');row.dataset.ability=i;const glyph=node('i',undefined,'abilityGlyph');glyph.innerHTML=icon(['insight','target','bolt'][i]);row.append(glyph,node('span',name));const meter=node('progress');meter.max=1;meter.value=ability.progress;meter.setAttribute('aria-label',name+' 레벨 진행도');row.append(meter,node('b','Lv. '+ability.level));abilities.append(row);});
  const range=node('button','범위','textButton');range.onclick=onCoverage;abilities.append(range);body.append(abilities);
  const accessory=node('section',undefined,'accessoryCard'+(growth.unlocked?' unlocked':''));accessory.innerHTML=`<span class="accessoryArt">${icon('pin')}<i>${icon('lock')}</i></span><div><b>하트 머리핀</b><small>${growth.unlocked?'고유 악세사리':'★★★ 해금'}</small></div><span aria-label="악세사리 성급 ${growth.accessory}성">${'★'.repeat(growth.accessory)+'☆'.repeat(2-growth.accessory)}</span>`;body.append(accessory);
  const talk=node('div',undefined,'talkChoices');for(const [name,group] of [['일상','everyday'],['쌍둥이','sister'],['응원','encourage']]){const b=node('button',name);b.onclick=()=>{show('home');onTalk(group);};talk.append(b);}body.append(talk);
  appendStories('haru');
 }
 function appendPortraitAction(id){const button=node('button',undefined,'portraitAction');button.innerHTML=icon('play')+'<span>감상</span>';button.onclick=()=>characterViewer.open(id);body.append(button);}
 function appendStories(id){
  const stories=storiesFor(id);if(!stories.length)return;
  const section=node('section',undefined,'storyList');section.append(node('h3','이야기'));
  for(const story of stories){const b=node('button',undefined,'storyButton');const text=node('span');text.append(node('b',story.title),node('small',story.cast.map(id=>illustratedStudents.find(s=>s.id===id).name).join(' · ')));b.append(text,node('span','›','storyArrow'));b.onclick=()=>characterViewer.open(id,story.id);section.append(b);}body.append(section);
 }
 function renderPortraitStudent(id){
  const student=illustratedStudents.find(x=>x.id===id);if(!student)return;
  const banner=node('div',undefined,'studentBanner portraitBanner');banner.dataset.student=id;banner.innerHTML='<span class="bannerCrest">'+icon('heart')+'</span><img src="'+student.portrait+'" alt="'+student.name+'"><div><span>'+student.subject+' · '+student.grade+'학년</span><h3>'+student.name+'</h3><b>'+student.role+'</b></div>';body.append(banner);appendPortraitAction(id);
  const profile=node('section',undefined,'infoCard characterProfile');profile.append(node('h3','소개'),node('p',student.profile),node('p',student.trait,'profileTrait'));body.append(profile);
  const shapes={ribbon:'<path d="M23 18C8 3 1 16 6 22c5 5 12 0 17-4Zm2 0C40 3 47 16 42 22c-5 5-12 0-17-4ZM20 22l-5 15 7-3 2-13 2 13 7 3-5-15"/><path d="M24 32c-9 10-6 14 0 14s9-4 0-14Z"/>',bookmark:'<path d="M15 7h18v35l-9-7-9 7Z"/><circle cx="24" cy="14" r="4"/><path d="M20 24h8"/>',frame:'<rect x="9" y="5" width="30" height="38" rx="3"/><rect x="14" y="10" width="20" height="28" rx="2"/><path d="m17 32 7-8 8 8"/>'};
  const accessory=node('section',undefined,'infoCard profileAccessory');accessory.style.setProperty('--character-accent',student.color);accessory.innerHTML='<svg class="profileAccessoryIcon" aria-hidden="true" viewBox="0 0 48 48">'+shapes[student.accessoryIcon]+'</svg><div><b>'+student.accessory+'</b><small>고유 악세사리</small></div>';body.append(accessory);
  for(const link of student.relations||[]){const relation=node('button',undefined,'relationButton');relation.append(node('span',illustratedStudents.find(x=>x.id===link.id).name),node('small',link.label+'  ›'));relation.onclick=()=>{studentDetail=link.id;render();body.scrollTop=0;};body.append(relation);}
  appendStories(id);
 }
 function renderSchedule(){
  title('일정');
  const cover=node('div',undefined,'scheduleCover');body.append(cover);
  const dateBar=node('div',undefined,'dateNavigator'),previous=node('button','‹'),next=node('button','›'),date=node('button');
  previous.setAttribute('aria-label','이전 날');next.setAttribute('aria-label','다음 날');date.textContent=new Date(selectedDate+'T12:00:00+09:00').toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric',weekday:'short'});date.setAttribute('aria-label','날짜 선택');
  previous.onclick=()=>{selectedDate=shiftDate(selectedDate,-1);render();};next.onclick=()=>{selectedDate=shiftDate(selectedDate,1);render();};date.onclick=()=>{openModal('<h2>날짜</h2><input type="date" id="scheduleDate" min="2000-01-01" max="2099-12-31"><button class="action solid" id="chooseDay">확인</button>');$('#scheduleDate').value=selectedDate;$('#chooseDay').onclick=()=>{if(validDate($('#scheduleDate').value)){selectedDate=$('#scheduleDate').value;closeModal();render();}};};dateBar.append(previous,date,next);cover.append(dateBar);
  const weekday=new Date(selectedDate+'T12:00:00Z').getUTCDay(),monday=shiftDate(selectedDate,-((weekday+6)%7)),strip=node('div',undefined,'weekStrip');strip.setAttribute('aria-label','주간 날짜');
  for(let i=0;i<7;i++){const day=shiftDate(monday,i),b=node('button');b.append(node('small',['월','화','수','목','금','토','일'][i]),node('b',String(Number(day.slice(8)))));b.setAttribute('aria-label',day);b.setAttribute('aria-pressed',String(day===selectedDate));if(day===koreanDate())b.dataset.today='true';if(planner.count(day))b.append(node('i',undefined,'planDot'));b.onclick=()=>{selectedDate=day;render();};strip.append(b);}body.append(strip);
  const today=node('button','오늘','textButton');today.onclick=()=>{selectedDate=koreanDate();render();};body.append(today);
  planner.renderDay(body,selectedDate,{onQuest:()=>{quests.resetDate();show('quests');},onRest:()=>quests.restOpen()});
 }
 function renderRecords(){title('기록');statistics.render(body,{historyOpen:true,mode:'records'});const list=document.createElement('details');list.className='reviewHistory';list.append(node('summary','마지막 질문'));for(const r of [...reviews.state.runs].reverse()){const first=r.qids.map(id=>r.answers.find(a=>a.qid===id)).filter(Boolean),b=node('button',`${r.name||'학생'} · ${r.lecture}강 · ${first.filter(a=>a.correct).length}/${r.qids.length}`,'reviewRetry');b.setAttribute('aria-label',b.textContent);b.onclick=()=>reviews.open(r.id);list.append(b);}body.append(list);}
 for(const b of document.querySelectorAll('[data-nav]'))b.onclick=()=>{if(b.dataset.nav==='momo')momo.reset();show(b.dataset.nav);};
 $('#screenBack').onclick=()=>{if(view==='momo'&&momo.back())return;if(view==='students'&&studentDetail){studentDetail=false;render();}else show('home');};
 $('#examButton').onclick=examEditor;$('#eventContext').onclick=()=>launch();$('#quickQuest').onclick=()=>{quests.resetDate();show('quests');};$('#quickRest').onclick=()=>quests.restOpen();$('#quickSchedule').onclick=()=>show('schedule');
 update();
 return {show,update,launch,examEditor,openSchedule(date){if(validDate(date))selectedDate=date;show('schedule');},refreshPanel(){if(view!=='home'){const scroll=body.scrollTop;render();body.scrollTop=scroll;}},get view(){return view;},get examDate(){return prefs.examDate;},export:()=>structuredClone(prefs),import(raw){prefs=normalizePreferences(raw);persist();update();if(view!=='home')render();}};
}

