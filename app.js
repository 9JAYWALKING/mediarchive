import {bondStories} from './bond-story-data.js?v=20261110ritsu';
import {createBondStoryUI} from './bond-story-ui.js?v=20261111ritsuExpressions';
import {createLobbyController} from './lobby-controller.js?v=20261111ritsuExpressions';
import {pickCharacterLine,characterDialogueBanks} from './character-dialogue.js?v=20261110ritsu';
import {teacherProfile,teacherName,teacherAddress,personalize,saveTeacher,teacherLevel,preventAppZoom} from './teacher-profile.js?v=20261110';
import {linkedLabel} from './linked-study.js?v=20261110';
preventAppZoom();
import {arrivalGreeting} from './arrival-dialogue.js?v=20261110ritsu';
import {createDialogueVisibility} from './dialogue-visibility.js';
import {configureWardrobe,refreshWardrobe,appearanceFor,wardrobeSettings,saveWardrobe} from './wardrobe-service.js?v=20261110ritsu';
import {wardrobeSettingsError} from './wardrobe-engine.js';
import {openWardrobeSettings} from './wardrobe-ui.js?v=20261110ritsu';
import {createReviewUI} from './review-ui.js?v=20261111ritsuExpressions';
import {studentGrowth} from './student-growth.js?v=20261110';
import {createDialoguePager} from './dialogue-pages.js';
import {createLectureAdvice} from './lecture-advice.js?v=20261110ritsu';
import {createClassCheckin} from './class-checkin.js?v=20261110ritsu';
import {createCharacter} from './renderer.js?v=20261111ritsuExpressions';
import {createQuizUI} from './quiz-ui.js';
import {createGameUI} from './game-ui.js?v=20261111walk';
import {normalizeChoice} from './game-state.js';
import {createDialogueDirector} from './dialogue.js';
import {sessionTotals,summarizeGrowth,normalizeGrowth,growthReminder} from './growth-engine.js?v=20261110';
import {normalizeStudy,studySnapshot,mergeStudy} from './study-store.js';
import {createGrowthUI} from './growth-ui.js';
import {configureRoutine,routineLine,configuredRoutineContext} from './routine-service.js?v=20261110ritsu';
import {createMomoUI} from './momo-ui.js?v=20261110ritsu';
import {createPlannerUI} from './planner-ui.js?v=20261111agendaTime';
import {startWorldTime} from './world-time.js?v=20261110hometalk';
import {createQuestUI} from './quest-ui.js?v=2';
const $=s=>document.querySelector(s),KEY='heart-companion-v1';let state=normalizeStudy(null),storageOK=true;
try{state=normalizeStudy(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{storageOK=false;}
let reviews=null,lectureAdviceUI=null,classCheckin=null,quiz=null,game=null,momo=null,planner=null,quests=null,growthUI=null,growthCache=null,growthSource=null,growthPlannerSource=null,lobby=null,bondEvents=null;
function haruExtras(){const events=state.growth.events;return (planner?.state.records||[]).filter(r=>r.student==='haru'&&!events.some(e=>e.id===r.id||e.at===r.at&&e.duration===r.duration));}
function getHaruMemories(){return [...state.memories,...haruExtras().map(r=>({id:r.id,date:new Date(r.at).toISOString(),duration:r.duration}))];}
function getGrowth(){const records=planner?.state.records;if(growthSource!==state.growth||growthPlannerSource!==records){growthSource=state.growth;growthPlannerSource=records;growthCache=summarizeGrowth({events:[...state.growth.events,...haruExtras().map(r=>({id:r.id,at:r.at,duration:r.duration,preview:r.preview||0,context:r.lecture&&r.track?{lecture:r.lecture,track:r.track}:undefined,targets:r.targets,completed:r.completed,complete:r.unitComplete===true,cycle:r.cycle||1}))]});}return growthCache;}
let lobbyId=teacherProfile().lobby||'haru';const characterRecent={};
function pickLine(group){if(!characterDialogueBanks[lobbyId])return {text:group==='start'?'준비됐어. 함께 시작하자.':group==='finish'?'고생했어. 잠깐 쉬어도 좋아.':teacherAddress()+', 여기 앉을래?',expression:'smile',group};const scene=document.documentElement.dataset.dayphase,key=lobbyId+':'+scene+':'+group,line=pickCharacterLine(lobbyId,group,{scene,teacher:teacherName(),recent:characterRecent[key]||[]});characterRecent[key]=[...(characterRecent[key]||[]),line.index].slice(-6);return line;}
function studentName(id=lobbyId){return planner?.state.settings.students.find(s=>s.id===id)?.name||'하루';}
const studentGrowthCache=new Map();
function selectedGrowth(id=lobbyId){if(id==='haru')return {...getGrowth(),bond:quiz?.score??20};const records=planner?.state.records||[],student=planner?.state.settings.students.find(s=>s.id===id)||{id,lectures:[]},cached=studentGrowthCache.get(id);if(cached?.records===records&&cached.student===student)return cached.value;const value=studentGrowth(records,student);studentGrowthCache.set(id,{records,student,value});return value;}
let character=null,lastTouch=0,lastSaved=0,lastLineAt=0,dialoguePrefs={};
try{dialoguePrefs=JSON.parse(localStorage.getItem(KEY+'-dialogue')||'{}')||{};}catch{}
const director=createDialogueDirector({recent:dialoguePrefs.recent||{}}),previousVisit=Number(dialoguePrefs.lastVisit)||0;
let quiet=dialoguePrefs.quiet===true;
function saveDialogue(){try{localStorage.setItem(KEY+'-dialogue',JSON.stringify({recent:director.history,quiet,lastVisit:Date.now()}));}catch{}}
const lobbyDialogue=createDialoguePager(58);let currentLobbyLine=null;
const lobbySpeech=createDialogueVisibility($('.dialogue'),{onHide:()=>{if($('.dialogue').contains(document.activeElement))$('#touch').focus({preventScroll:true});}});
function renderDialoguePage(){lobbySpeech.show();lastLineAt=Date.now();$('#line').textContent=lobbyDialogue.text;character?.speak(currentLobbyLine,lobbyDialogue.text);$('#nextLine').setAttribute('aria-label',lobbyDialogue.hasNext?'다음 대사':studentName()+'에게 한 번 더 말 걸기');$('#nextLine').dataset.continued=String(lobbyDialogue.hasNext);$('.dialogue').classList.remove('new-line');requestAnimationFrame(()=>$('.dialogue').classList.add('new-line'));}
function say(line){if(!line)return;if(typeof line==='string')line={text:line,group:'touch'};currentLobbyLine=line;lobbyDialogue.set(personalize(line.text));$('#line').dataset.group=line.group;renderDialoguePage();}
function speak(group){say(pickLine(group));director.schedule(Date.now());character?.react();saveDialogue();}
let toastTimer;function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000);}
function elapsed(){const f=planner?.focus;return f?f.elapsed+(f.started?Math.max(0,Date.now()-f.started):0):sessionTotals(state.session).duration;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(studySnapshot(state)));storageOK=true;return true;}catch{if(storageOK)toast('저장 공간 부족. 설정에서 기록을 내보내세요.');storageOK=false;return false;}}
function checkpoint(){quests?.capture(Date.now(),true);if(state.session){const totals=sessionTotals(state.session);state.session.elapsed=totals.duration;state.session.previewElapsed=totals.preview;state.session.started=null;}}
function format(ms){const seconds=Math.floor(ms/1000);return (seconds>=3600?String(Math.floor(seconds/3600)).padStart(2,'0')+':':'')+String(Math.floor(seconds/60)%60).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
function refresh(){const session=state.session||planner?.focus,active=!!session;$('#start').hidden=active;$('#sessionActions').hidden=!active;$('#timer').textContent=format(elapsed());$('#sessionLabel').textContent=active?(session.started?'진행 중':'일시정지'):'대기';$('#pause').textContent=session?.started?'일시정지':'재개';renderBond();game?.update();bondEvents?.tick();}
function selectStudying(id){if(!id)return;saveTeacher({lastStudy:id,lobby:id});if(lobby)lobby.select(id,{greet:false});game?.show('home');}

function startSession(context,mode='new',planId,briefed=false){if(!canStudy(()=>startSession(context,mode,planId,briefed)))return;if(!briefed&&lectureAdviceUI.open(context,()=>startSession(context,mode,planId,true)))return;selectStudying('haru');state.session={id:crypto.randomUUID(),elapsed:0,previewElapsed:0,started:Date.now(),context:normalizeChoice(context),planId,cycle:getGrowth().cycle,mode};director.schedule(Date.now());save();refresh();speak('start');}
$('#start').onclick=()=>game.launch();
function resumeSession(){if(!state.session||!canStudy(resumeSession))return;state.session.started=Date.now();director.schedule(Date.now());save();refresh();speak('resume');}
$('#pause').onclick=()=>{if(planner?.focus){if(planner.focus.started){planner.pauseForRest();speak('pause');}else{planner.resumeFocus();speak('resume');}refresh();return;}if(!state.session)return;if(state.session.started){checkpoint();speak('pause');save();refresh();}else resumeSession();};
function canStudy(continuation,student='haru'){if(quests?.resting){quests.restOpen();return false;}return classCheckin?.allow(continuation,student)??true;}
$('#finish').onclick=()=>{if(planner?.focus){planner.focusModal();return;}if(!state.session)return;checkpoint();save();refresh();growthUI.finish();};
function commitEvent(event){
 const planId=state.session?.planId,before=getGrowth(),next={...state,session:null,memories:[...state.memories],growth:state.growth};
 if(event){next.growth=normalizeGrowth({events:[...state.growth.events,event]});if(!next.memories.some(m=>m.id===event.id))next.memories.push({id:event.id,date:new Date(event.at).toISOString(),duration:event.duration,...(event.context?{context:event.context}:{})});}
 try{localStorage.setItem(KEY,JSON.stringify(studySnapshot(next)));storageOK=true;}catch{storageOK=false;return {ok:false};}
 state=next;planner?.record(planId,event);const after=getGrowth();
 if(event?.complete){const covered=new Set(after.coverage.flat()),tracks=['Wiki','J','JBL'];let stage=0;while(stage<3&&covered.has(`${event.context.lecture}:${tracks[stage]}`))stage++;if(stage)quiz.confirmLesson(event.context.lecture,stage,event.at);}
 quiz.refresh();refresh();game.refreshPanel();speak(event&&event.duration>=300000?'finish':'shortFinish');const reviewId=event?reviews.enqueue({...event,lecture:event.context?.lecture,track:event.context?.track,student:'haru',name:'하루'}):false;return {ok:true,before,after,reviewId};
}
function touch(){if(lobby?.swiped)return;if(lobbySpeech.hidden){lastTouch=Date.now();renderDialoguePage();character?.react();return;}if(lobbyDialogue.hasNext){if(Date.now()-lastTouch<250)return;lastTouch=Date.now();lobbyDialogue.next();renderDialoguePage();director.schedule(Date.now());return;}if(lobbyId==='haru'&&quiz?.pending){quiz.openQuestion();return;}const now=Date.now();if(now-lastTouch<900)return;lastTouch=now;const bond=1+Math.floor((quiz?.score||0)/100);const choice=director.touch({now,active:!!(state.session?.started||planner?.focus?.started),bond});say(pickLine(choice.group));character?.react();saveDialogue();}
$('#touch').onclick=touch;$('#nextLine').onclick=touch;
function refreshQuiet(){$('#quietToggle').classList.toggle('is-on',quiet);$('#quietToggle').setAttribute('aria-pressed',String(quiet));$('#quietToggle').setAttribute('aria-label',quiet?'자동 대사 켜기':'자동 대사 끄기');}
$('#quietToggle').onclick=()=>{quiet=!quiet;director.schedule(Date.now());saveDialogue();refreshQuiet();toast(quiet?'자동 대사 꺼짐':'자동 대사 켜짐');};
$('#stage').addEventListener('pointermove',e=>{const r=$('#stage').getBoundingClientRect();character?.look((e.clientX-r.left)/r.width*1.6-.8);});$('#stage').addEventListener('pointerleave',()=>character?.look(0));
$('#motionToggle').onclick=()=>{if(!character)return;character.setMotion(!character.motion);updateMotion();};
function updateMotion(){const moving=character?.motion;$('#motionToggle').innerHTML=moving?'<svg><use href="#i-pause"/></svg>':'<svg><use href="#i-play"/></svg>';$('#motionToggle').setAttribute('aria-label',moving?'캐릭터 움직임 잠시 멈추기':'캐릭터 움직임 켜기');}
function modal(html){$('#modalContent').innerHTML=html;$('#modal').setAttribute('aria-label',$('#modalContent h2')?.textContent||'메뉴');$('#modal').showModal();}$('#closeModal').onclick=()=>$('#modal').close();$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))$('#modal').close();});
$('#modal').addEventListener('close',()=>{director.schedule(Date.now());game?.refreshPanel();});
$('#settings').onclick=()=>{modal('<div class="appIdentity"><img src="./assets/icons/mediarchive-180.png" width="64" height="64" alt="웃는 하루"><strong>Mediarchive</strong></div><h2>설정</h2><button class="action" id="teacherSettings">선생님</button><button class="action" id="lobbySettings">홈 학생</button><button class="action" id="backgroundSettings">배경</button><button class="action" id="examSettings">시험</button><button class="action" id="coverage">범위</button><button class="action" id="wardrobeSettings">복장</button><p>이 브라우저에 저장 · 기기 간 동기화 없음</p><button class="action" id="export">내보내기</button><button class="action" id="import">가져오기</button><input type="file" accept="application/json,.json" id="importFile" hidden><p id="importStatus" role="status"></p>');
 $('#backgroundSettings').onclick=()=>$('.worldClock').click();$('#teacherSettings').onclick=teacherEditor;$('#lobbySettings').onclick=()=>lobby.picker();
 $('#examSettings').onclick=()=>game.examEditor();
 $('#coverage').onclick=()=>quiz.openProgress();
 $('#wardrobeSettings').onclick=()=>openWardrobeSettings({openModal:modal,closeModal:()=>$('#modal').close(),toast});
 $('#export').onclick=()=>{const data={version:14,recall:game.recall.export(),bondStories:bondEvents.export(),teacher:teacherProfile(),wardrobe:wardrobeSettings(),reviews:reviews.export(),quests:quests.export(),planner:planner.export(),momo:momo.export(),memories:state.memories,growth:state.growth,quiz:quiz.export(),preferences:game.export()};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='mediarchive-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('#import').onclick=()=>$('#importFile').click();$('#importFile').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>10000000)throw Error();const data=JSON.parse(await file.text());if(![1,2,3,4,5,6,7,8,9,10,11,12,13,14].includes(data.version)||!Array.isArray(data.memories)||data.memories.length>20000||data.memories.some(m=>!Number.isFinite(m.duration)||m.duration<0||m.duration>604800000||!Number.isFinite(Date.parse(m.date))))throw Error();if(data.version>=4&&(!data.growth||data.growth.version!==1||!Array.isArray(data.growth.events)||data.growth.events.length>20000))throw Error();if(data.version>=5&&(!data.momo||data.momo.version!==1||!Array.isArray(data.momo.messages)||!Array.isArray(data.momo.plans)||data.momo.messages.length>2000||data.momo.plans.length>2000))throw Error();if(data.version>=6&&(!data.planner||data.planner.version!==1||!Array.isArray(data.planner.plans)||data.planner.plans.length>10000))throw Error();if(data.version>=8&&(!data.quests||data.quests.version!==1||!Array.isArray(data.quests.runs)||!data.quests.attendance))throw Error();if(data.version>=9&&(!data.planner.meals||data.planner.meals.version!==1||!Array.isArray(data.planner.meals.days)))throw Error();if(data.version>=10&&(!data.reviews||data.reviews.version!==1||!Array.isArray(data.reviews.runs)||data.reviews.runs.length>20000))throw Error();if(data.version>=11&&(!data.wardrobe||data.wardrobe.version!==1||wardrobeSettingsError(data.wardrobe)))throw Error();if(data.version>=13&&(!data.bondStories||data.bondStories.version!==1||!Array.isArray(data.bondStories.events)||data.bondStories.events.length>bondStories.length))throw Error();if(data.version>=14&&(!data.recall||data.recall.version!==1||!data.recall.ratings||typeof data.recall.ratings!=='object'))throw Error();if(data.version>=12&&data.teacher)saveTeacher(data.teacher);const candidate=mergeStudy(state,data);localStorage.setItem(KEY,JSON.stringify(studySnapshot(candidate)));state=candidate;const quizOK=data.version>=2?quiz.import(data.quiz):true;if(data.version>=3&&data.preferences)game.import(data.preferences);const plannerOK=data.version>=6?planner.import(data.planner):true;const momoOK=data.version>=5?momo.import(data.momo):true;const questOK=data.version>=8?quests.import(data.quests):true;const reviewOK=data.version>=10?reviews.import(data.reviews):true;const wardrobeOK=data.version>=11?saveWardrobe(data.wardrobe):true;const bondStoriesOK=data.version>=13?bondEvents.import(data.bondStories):true;const recallOK=data.version>=14?game.recall.import(data.recall):true;refreshWardrobe(true);if(data.version>=12&&data.teacher)lobby?.select(teacherProfile().lobby,{greet:false});storageOK=true;refresh();$('#importStatus').textContent=quizOK&&momoOK&&plannerOK&&questOK&&reviewOK&&wardrobeOK&&bondStoriesOK&&recallOK?'가져오기 완료':'가져오기 완료 · 일부 기록 저장 실패';}catch{$('#importStatus').textContent='파일을 읽거나 저장할 수 없습니다.';}};
};
function renderBond(){const g=selectedGrowth(),score=Math.max(0,g.bond+(reviews?.delta(lobbyId)||0)+(quests?.penalty(lobbyId)||0));$('#bondLevel').textContent=1+Math.floor(score/100);$('#bondProgress').value=score%100;$('#bondPoints').textContent=(score%100)+' / 100';}
function teacherEditor(){modal('<h2>선생님</h2><form id="teacherForm"><label class="fieldLabel" for="teacherName">이름</label><input id="teacherName" maxlength="16" autocomplete="nickname" placeholder="이름"><button class="action solid" type="submit">저장</button></form>');$('#teacherName').value=teacherName();$('#teacherForm').onsubmit=e=>{e.preventDefault();if(saveTeacher({name:$('#teacherName').value})){ $('#modal').close();refresh();speak('greeting');}else toast('저장하지 못했어. 다시 시도해 줘.');};}
$('#teacherBadge').onclick=teacherEditor;

reviews=createReviewUI({beforeOpen:()=>{if(state.session?.started){checkpoint();save();refresh();}planner?.pauseForRest();},getBond:id=>Math.max(0,(id==='haru'?(quiz?.score??20):studentGrowth(planner?.state.records||[],planner?.state.settings.students.find(s=>s.id===id)||{id,lectures:[]}).bond)+(reviews?.delta(id)||0)+(quests?.penalty(id)||0)),onChange:()=>{refresh();game?.refreshPanel();},onReaction:(id,r)=>{if(id===lobbyId){say({text:r.text,expression:r.expression});}},toast});
lectureAdviceUI=createLectureAdvice({openModal:modal,closeModal:()=>$('#modal').close(),onLine:say});
quiz=createQuizUI({onExpression:name=>{currentLobbyLine={...currentLobbyLine,expression:name};character?.speak(currentLobbyLine,lobbyDialogue.text);},getMemories:getHaruMemories,onLine:text=>{say(text);director.schedule(Date.now());character?.react();},onBondChange:renderBond,openModal:modal,closeModal:()=>$('#modal').close(),toast});
growthUI=createGrowthUI({getState:()=>state,getGrowth,openModal:modal,closeModal:()=>$('#modal').close(),onCommit:commitEvent,onReview:id=>reviews.open(id),onContinue:resumeSession,onLaunch:(lecture,track)=>game.launch(lecture,track),format});
planner=createPlannerUI({getHaruGrowth:getGrowth,onStudyStarted:id=>{selectStudying(id);speak('start');refresh();},onStudyFinished:event=>{selectStudying(event.student);speak('finish');refresh();const id=reviews.enqueue(event);if(id)reviews.open(id);},beforeTimerChange:()=>quests?.capture(Date.now(),true),canStudy,beforeStudy:(context,next)=>lectureAdviceUI.open(context,next),openModal:modal,closeModal:()=>$('#modal').close(),toast,getSession:()=>state.session,onChange:()=>{game?.refreshPanel();refreshWardrobe();refresh();},onSchedule:date=>game.openSchedule(date),onLaunch:(lecture,track,id)=>game.launch(lecture,track,id)});
quests=createQuestUI({getStudy:()=>state,getPlanner:()=>planner.state,pauseStudy:()=>{if(state.session?.started){checkpoint();save();refresh();}},pausePlanner:()=>planner.pauseForRest(),openModal:modal,closeModal:()=>$('#modal').close(),onPlan:seed=>planner.edit(seed),onLine:say,onChange:()=>{refresh();game?.refreshPanel();},toast});
configureWardrobe(()=>planner.state.meals);
startWorldTime({openModal:modal});
bondEvents=createBondStoryUI({getBond:id=>Math.max(0,selectedGrowth(id).bond+(reviews?.delta(id)||0)+(quests?.penalty(id)||0)),beforeOpen:()=>{if(state.session?.started){checkpoint();save();refresh();}planner?.pauseForRest();},onChange:()=>{momo?.updateBadge();game?.refreshPanel();},toast});
momo=createMomoUI({planner,bondEvents,getStudy:()=>state,getExamDate:()=>game?.examDate,openModal:modal,closeModal:()=>$('#modal').close(),onSchedule:date=>game.openSchedule(date),onLaunch:lecture=>game.launch(lecture),toast});
game=createGameUI({beforeRecall:()=>{if(state.session?.started){checkpoint();save();refresh();}planner?.pauseForRest();},bondEvents,getLobby:()=>lobbyId,getStudentGrowth:selectedGrowth,onLobby:id=>lobby.select(id),reviews,getState:()=>state,getQuiz:()=>quiz,getGrowth,momo,planner,quests,openModal:modal,closeModal:()=>$('#modal').close(),onStart:startSession,onTalk:speak,onCoverage:()=>quiz.openProgress(),onGrowth:()=>growthUI.progress(),toast,format});
planner.importLegacyMomo(momo.export());
momo.tick();setInterval(()=>{if(!document.hidden)momo.tick();},60000);
configureRoutine(()=>({scene:document.documentElement.dataset.dayphase,meals:planner.state.meals,quiet,visible:!document.hidden,blocked:lobbyDialogue.hasNext||!!quiz.pending||!!quests?.resting,lastInteraction:Math.max(lastTouch,lastLineAt),growth:getGrowth()}));
classCheckin=createClassCheckin({openModal:modal,closeModal:()=>$('#modal').close(),onLine:say,
 onPause:()=>{if(state.session?.started){checkpoint();save();refresh();}planner.pauseForRest();},
 onReady:()=>{if(planner.focus){planner.resumeFocus();return;}if(state.session)resumeSession();else game.launch();},
 isBlocked:()=>document.hidden||!!document.querySelector('dialog[open]')||!!quiz.pending||!!quests?.resting});
const routineButton=document.createElement('button');routineButton.className='routineNow';routineButton.textContent='지금';routineButton.setAttribute('aria-label','지금 일정');routineButton.onclick=()=>{if(lobbyId==='haru'&&quiz.pending){quiz.openQuestion();return;}say(routineLine(lobbyId,{force:true}));director.schedule(Date.now());character?.react();};$('.dialogue').append(routineButton);
const hasDialog=()=>!!document.querySelector('dialog[open]');
document.addEventListener('mediarchive:scenechange',event=>{if(event.detail.id==='home'&&!quiet&&!document.hidden&&!hasDialog()&&!lobbyDialogue.hasNext&&!quiz.pending&&!quests?.resting&&game.view==='home')speak('greeting');});
function checkLateArrival(){if(document.hidden||hasDialog()||game.view!=='home')return false;const event=quests.takeArrival();if(!event)return false;game.showArrival(arrivalGreeting(event));return true;}
function checkRoutine(){
 if(lobbyDialogue.hasNext||game.view!=='home'||hasDialog())return false;
 const line=routineLine(lobbyId);if(!line)return false;
 say(line);director.schedule(Date.now());character?.react();return true;
}
const reminderButton=document.createElement('button');reminderButton.className='reminderButton';reminderButton.hidden=true;reminderButton.textContent='하루 · 확인  ›';$('.session').before(reminderButton);
const bootAt=Date.now();let reminderAt=0;try{reminderAt=Number(localStorage.getItem(KEY+'-reminder'))||0;}catch{}
reminderButton.onclick=()=>{reminderButton.hidden=true;growthUI.progress();};
function checkReminder(){
 if(quests?.resting){reminderButton.hidden=true;return;}
 if(!['morning','review','evening'].includes(configuredRoutineContext().phase)){reminderButton.hidden=true;return;}
 if(lobbyId!=='haru'||state.session||planner.focus||game.view!=='home'||getGrowth().cycles>=3){reminderButton.hidden=true;return;}
 if(lobbyDialogue.hasNext||quiet||document.hidden||quiz.pending||hasDialog()||Date.now()-lastLineAt<90000||Date.now()-bootAt<20000||Date.now()-reminderAt<12*3600000)return;
 const reminder=growthReminder(state.growth,game.examDate);if(!reminder)return;
 say({text:reminder.line,group:'return'});character?.react();reminderButton.hidden=false;reminderAt=Date.now();try{localStorage.setItem(KEY+'-reminder',String(reminderAt));}catch{}
}
setInterval(()=>{checkLateArrival();classCheckin.check();refresh();const studyTime=['morning','review','evening'].includes(configuredRoutineContext().phase);quiz.tick({active:lobbyId==='haru'&&!!state.session?.started,visible:!document.hidden,blocked:lobbyId!=='haru'||lobbyDialogue.hasNext||!!quests?.resting||!studyTime||hasDialog()||game.view!=='home'||Date.now()-lastTouch<60000,quiet});const routineShown=checkRoutine();if(!routineShown)checkReminder();if(state.session?.started||planner.focus?.started){if(Date.now()-lastSaved>=5000){save();lastSaved=Date.now();}if(!lobbyDialogue.hasNext&&studyTime&&!routineShown&&!quiet&&!quiz.pending&&game.view==='home'){const line=director.ambient({now:Date.now(),active:true,visible:!document.hidden,modalOpen:hasDialog(),duration:elapsed()});if(line){say(pickLine(line.group));character?.react();saveDialogue();}}}},1000);
window.addEventListener('pagehide',()=>{save();saveDialogue();quiz.save();});document.addEventListener('visibilitychange',()=>{if(document.hidden){save();saveDialogue();quiz.save();}else{director.schedule(Date.now());checkLateArrival();classCheckin.check();}});refresh();refreshQuiet();
const welcome=routineLine(lobbyId);if(welcome)say(welcome);else speak(state.session?'resume':previousVisit&&Date.now()-previousVisit>3*86400000?'return':'greeting');director.schedule(Date.now());
checkLateArrival();classCheckin.check();
lobby=createLobbyController({getStudents:()=>planner.state.settings.students,openModal:modal,closeModal:()=>$('#modal').close(),onMotionChange:updateMotion,onSelect:(id,greet)=>{lobbyId=id;refresh();if(greet)speak('greeting');},onReady:model=>{character=model;if(model){model.speak(currentLobbyLine,lobbyDialogue.text);updateMotion();}}});
const latest=[...planner.state.records.map(r=>({id:r.student,at:r.at})),...state.growth.events.map(r=>({id:'haru',at:r.at}))].sort((a,b)=>b.at-a.at)[0]?.id;
await lobby.select(state.session?'haru':planner.focus?.student||(teacherProfile().updatedAt?teacherProfile().lobby:latest)||'haru',{greet:true});
